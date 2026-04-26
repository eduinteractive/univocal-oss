import { NextFunction, Request, Response } from "express"
import { randomBytes } from "crypto";
import UserAccount, { ActivationStatus, AuthProvider, PublicUserAccountAndContact, UserAccountDoc } from "../models/UserAccount";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import UserContact, { UserContactDoc } from "../models/UserContact";
import { AuthentificationError, BadRequestError, ForbiddenError, NotFoundError, RedisClient, REQ_CLIENT, sendBrevoTemplateMail } from "@eduinteractive/uvc-common";
import { normalizeUserData, setAuthCookie } from "../services/Authentification";
import { schacHomeOrganizationFromPairwiseId } from "../utils/schacHomeOrganizationFromPairwiseId";

interface LoginRequest {
    mail: string;
    password: string;
}

const getHeader = (req: Request, name: string): string | undefined => {
    const raw = req.headers[name.toLowerCase()];
    if (raw === undefined) return undefined;
    return Array.isArray(raw) ? raw[0] : raw;
};

/**
 * Apache/Shibboleth kann bei fehlenden Attributen als Headerwert wörtlich "(null)" senden.
 * Das behandeln wir wie "nicht vorhanden".
 */
const normalizeShibHeaderValue = (value: string | undefined): string | undefined => {
    if (value === undefined) return undefined;
    const v = value.trim();
    if (!v) return undefined;
    const lower = v.toLowerCase();
    if (lower === "(null)" || lower === "null") return undefined;
    return v;
};

/**
 * Löscht Shibboleth SP Cookies im Browser, ohne Shibboleth Logout zu callen.
 * Shibboleth Session wird dadurch für den Client effektiv beendet (Server-side Cleanup
 * läuft über die SessionCache timeout / cleanup).
 */
const clearShibbolethSessionCookiesIfWeb = (req: Request, res: Response) => {
    if (req.client !== REQ_CLIENT.WEB) return;
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return;

    const isSecure =
        req.secure ||
        (req.headers["x-forwarded-proto"] as string | undefined) === "https" ||
        process.env.ENVIRONMENT === "PRODUCTION";

    const prefixes = ["_shibsession_", "_shibstate_", "_shibauth_", "_shibuid"];
    const cookies = cookieHeader.split(";").map((c) => c.trim());

    for (const cookie of cookies) {
        const eqIdx = cookie.indexOf("=");
        const name = (eqIdx === -1 ? cookie : cookie.slice(0, eqIdx)).trim();
        if (!name) continue;
        if (!prefixes.some((p) => name.startsWith(p))) continue;
        // path muss mit dem Shibboleth cookieProps übereinstimmen (typisch: "/")
        res.clearCookie(name, { path: "/", secure: isSecure });
    }
};

// Helper function to get client IP address
const getClientIP = (req: Request): string => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (req.headers['x-real-ip'] as string) ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown';
};

// Helper function to increment failed login attempts
const incrementFailedAttempts = async (email: string, ip: string): Promise<void> => {
    const bruteForceKey = `brute_force_${email.toLowerCase()}_${ip}`;
    const currentAttempts = await RedisClient.get(bruteForceKey);
    const attempts = currentAttempts ? parseInt(currentAttempts) + 1 : 1;

    // Set with 5 minutes TTL (300 seconds)
    await RedisClient.setEx(bruteForceKey, 300, attempts.toString());
};


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as LoginRequest;
        const clientIP = getClientIP(req);

        // Brute force protection: Check if email+IP combination is blocked
        const bruteForceKey = `brute_force_${body.mail.toLowerCase()}_${clientIP}`;
        const failedAttempts = await RedisClient.get(bruteForceKey);

        if (failedAttempts && parseInt(failedAttempts) >= 3) {
            const ttl = await RedisClient.ttl(bruteForceKey);
            const remainingMinutes = Math.ceil(ttl / 60);
            throw new ForbiddenError(`Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuche es in ${remainingMinutes} Minuten erneut.`);
        }

        const userAccount = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${body.mail}$`, 'i') } // case-insensitive regex
        });
        if (!userAccount) {
            // Increment failed attempts for non-existent user
            await incrementFailedAttempts(body.mail.toLowerCase(), clientIP);
            throw new ForbiddenError("Das Passwort und der Benutzername stimmen nicht überein!");
        }

        if (userAccount.authProvider === AuthProvider.DFN_AAI) {
            throw new ForbiddenError("Bitte melde dich über deinen Hochschulaccount an.");
        }

        const isPasswordValid = await bcrypt.compare(body.password, userAccount.password);
        if (!isPasswordValid) {
            // Increment failed attempts for wrong password
            await incrementFailedAttempts(body.mail.toLowerCase(), clientIP);
            throw new ForbiddenError("Das Passwort und der Benutzername stimmen nicht überein!");
        }

        if (userAccount.activationStatus === ActivationStatus.NOT_VERIFIED) {
            throw new ForbiddenError("Du hast deine E-Mail-Adresse noch nicht bestätigt! Schau in deinem E-Mail-Postfach nach, um auf den Link in der Bestätigungsmail zu klicken.")
        }

        if (userAccount.activationStatus === ActivationStatus.BANNED) {
            throw new ForbiddenError("Dein Account wurde von einem*r Administrator*in gesperrt! Bitte wende dich an den Support.");
        }

        // Clear failed attempts on successful login
        await RedisClient.del(bruteForceKey);

        const userAccountAndContact = await userAccount.populate("contact") as UserAccountDoc & { contact: UserContactDoc };

        const formattedResponse = normalizeUserData(userAccountAndContact);

        const token = sign(formattedResponse,
            process.env.JWT_ENCRYPTION_KEY as string,
            { expiresIn: req.client === REQ_CLIENT.MOBILE ? "7d" : "1h" }
        );

        const refreshToken = sign(
            { _id: userAccount._id },
            process.env.JWT_ENCRYPTION_KEY as string,
            { expiresIn: req.client === REQ_CLIENT.MOBILE ? "31d" : "7d" }
        )

        userAccount.refreshToken = refreshToken;
        userAccount.refreshTokenExpire = new Date(Date.now() +
            (req.client === REQ_CLIENT.MOBILE ? 31 : 7) * 24 * 60 * 60 * 1000
        );
        userAccount.lastSignDate = new Date();

        await RedisClient.del("auth_invalidate_" + userAccount._id);
        await userAccount.save();

        if (req.client === REQ_CLIENT.WEB) {
            setAuthCookie(res, token, refreshToken);

            res.status(200).json(formattedResponse);
        } else {
            res.status(200).json({
                ...formattedResponse,
                authToken: token,
                refreshToken: refreshToken
            });
        }
    } catch (err) {
        next(err);
    }
}

export const dfnLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pairwiseId = normalizeShibHeaderValue(
            getHeader(req, "x-pairwise-id") || getHeader(req, "x-remote-user")
        );
        const mail = normalizeShibHeaderValue(getHeader(req, "x-mail"));
        const givenName = normalizeShibHeaderValue(getHeader(req, "x-given-name"));
        const sn = normalizeShibHeaderValue(getHeader(req, "x-sn"));

        if (!pairwiseId) {
            clearShibbolethSessionCookiesIfWeb(req, res);
            return res.redirect(`/?status=4001`)
        }
        if (!mail || !givenName || !sn) {
            clearShibbolethSessionCookiesIfWeb(req, res);
            return res.redirect(`/?status=4002`)
        }

        let userAccount = await UserAccount.findOne({ pairwiseId }) as UserAccountDoc | null;

        if (!userAccount) {
            userAccount = await UserAccount.findOne({
                mail: { $regex: new RegExp(`^${mail}$`, "i") },
            }) as UserAccountDoc | null;

            if (userAccount) {
                throw new ForbiddenError("Dieser Account ist mit einer anderen Hochschul-Identität verknüpft. Bitte wende dich an den Support.");
            }
        }

        if (userAccount) {
            if (userAccount.pairwiseId && userAccount.pairwiseId !== pairwiseId) {
                throw new ForbiddenError("Dieser Account ist mit einer anderen Hochschul-Identität verknüpft.");
            }
            if (userAccount.activationStatus === ActivationStatus.BANNED) {
                throw new ForbiddenError("Dein Account wurde von einem*r Administrator*in gesperrt! Bitte wende dich an den Support.");
            }

            if (userAccount.activationStatus === ActivationStatus.NOT_VERIFIED) {
                userAccount.activationStatus = ActivationStatus.ACTIVATED;
                userAccount.activationToken = undefined;
            }

            if (!userAccount.pairwiseId) {
                userAccount.pairwiseId = pairwiseId;
            }

            const contact = await UserContact.findById(userAccount.contact);
            if (contact) {
                contact.first_name = givenName;
                contact.last_name = sn;
                await contact.save();
            }

            if (userAccount.mail.toLowerCase() !== mail.toLowerCase()) {
                userAccount.mail = mail.toLowerCase();
            }

            userAccount.lastSignDate = new Date();
            await userAccount.save();
        } else {
            const userContact = UserContact.build({
                first_name: givenName,
                last_name: sn,
            });
            await userContact.save();

            const randomPassword = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

            userAccount = UserAccount.build({
                mail: mail.toLowerCase(),
                password: randomPassword,
                permissionLevel: 0,
                groups: [],
                domains: [],
                dataProtectionAgreement: true,
                activationStatus: ActivationStatus.ACTIVATED,
                lastSignDate: new Date(),
                registerDate: new Date(),
                contact: userContact._id,
                devices: [],
                authProvider: AuthProvider.DFN_AAI,
                pairwiseId,
            });
            await userAccount.save();
        }

        const userAccountAndContact = await userAccount.populate("contact") as UserAccountDoc & { contact: UserContactDoc };
        const formattedResponse = normalizeUserData(userAccountAndContact);

        const token = sign(formattedResponse,
            process.env.JWT_ENCRYPTION_KEY as string,
            { expiresIn: req.client === REQ_CLIENT.MOBILE ? "7d" : "1h" }
        );

        const refreshToken = sign(
            { _id: userAccount._id },
            process.env.JWT_ENCRYPTION_KEY as string,
            { expiresIn: req.client === REQ_CLIENT.MOBILE ? "31d" : "7d" }
        );

        userAccount.refreshToken = refreshToken;
        userAccount.refreshTokenExpire = new Date(Date.now() +
            (req.client === REQ_CLIENT.MOBILE ? 31 : 7) * 24 * 60 * 60 * 1000
        );

        await RedisClient.del("auth_invalidate_" + userAccount._id);
        await userAccount.save();

        if (req.client === REQ_CLIENT.WEB) {
            setAuthCookie(res, token, refreshToken);
            res.status(200).redirect(`/`);
        } else {
            res.status(200).json({
                ...formattedResponse,
                authToken: token,
                refreshToken: refreshToken
            });
        }
    } catch (err) {
        next(err);
    }
}

/** Same Shibboleth session + JWT handoff as `dfnLogin` (optional second path for Apache/proxy setups). */
export const dfnBridge = dfnLogin;

interface RegisterRequest {
    mail: string;
    password: string;
    contact: {
        first_name: string;
        last_name: string;
    }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as RegisterRequest;

        const existingUser = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${body.mail}$`, 'i') } // case-insensitive regex
        });
        if (existingUser) {
            throw new BadRequestError("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits!");
        }

        const activationToken = Math.random().toString(36).substring(2, 26);

        await sendBrevoTemplateMail({
            to: [{ email: body.mail.toLowerCase() }],
            templateId: 21,
            params: {
                verifyLink: `${process.env.PUBLIC_URL}/verify?token=${activationToken}`
            }
        })

        const userContact = UserContact.build(body.contact);
        await userContact.save();

        const hashedPassword = await bcrypt.hash(body.password, 10);
        const userAccount = UserAccount.build({
            mail: body.mail.toLowerCase(),
            password: hashedPassword,
            permissionLevel: 0,
            groups: [],
            domains: [],
            dataProtectionAgreement: false,
            activationStatus: ActivationStatus.NOT_VERIFIED,
            activationToken: activationToken,
            lastSignDate: new Date(),
            registerDate: new Date(),
            contact: userContact._id,
            devices: [],
            authProvider: AuthProvider.LOCAL,
        });
        await userAccount.save();

        const formattedResponse = UserAccount.normalize(userAccount, userContact);

        res.status(201).json(formattedResponse);
    } catch (err) {
        next(err);
    }
}

export const check = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.client === REQ_CLIENT.MOBILE ? req.headers.authorization?.substring(7) : req.cookies.token;
        const refreshToken = req.client === REQ_CLIENT.MOBILE ? (req.headers["x-refresh-token"] as string)?.substring(7) : req.cookies.refreshToken;
        let decodedToken;
        let rAuthKey;
        if (token) {
            try {
                decodedToken = verify(token, process.env.JWT_ENCRYPTION_KEY as string) as PublicUserAccountAndContact;
                if (decodedToken) {
                    rAuthKey = await RedisClient.get("auth_invalidate_" + decodedToken._id);
                }
            } catch (err) {
                decodedToken = null;
            }
        }

        if (!token || !decodedToken || rAuthKey) {
            if (!refreshToken) {
                throw new AuthentificationError("Du bist nicht mehr angemeldet!")
            } else {
                const decodedRefreshToken = verify(refreshToken, process.env.JWT_ENCRYPTION_KEY as string) as PublicUserAccountAndContact;
                if (!decodedRefreshToken) {
                    throw new AuthentificationError("Du bist nicht mehr angemeldet!")
                } else {
                    const userAccount = await UserAccount.findById(decodedRefreshToken._id).populate('contact') as unknown as UserAccountDoc & { contact: UserContactDoc };

                    if (!userAccount) {
                        throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
                    }

                    if (userAccount.refreshTokenExpire && userAccount.refreshTokenExpire < new Date()) {
                        throw new AuthentificationError("Du bist nicht mehr angemeldet!")
                    }

                    const userPublicData = normalizeUserData(userAccount);

                    const newToken = sign(userPublicData,
                        process.env.JWT_ENCRYPTION_KEY as string,
                        { expiresIn: req.client === REQ_CLIENT.MOBILE ? "7d" : "1h" }
                    );

                    await RedisClient.del("auth_invalidate_" + userAccount._id);

                    if (req.client === REQ_CLIENT.WEB) {
                        setAuthCookie(res, newToken);

                        res.status(200).json(userPublicData);
                    } else {
                        res.status(200).json({
                            ...userPublicData,
                            authToken: newToken,
                            refreshToken: refreshToken
                        });
                    }
                }
            }
        } else {
            if (!decodedToken) {
                throw new AuthentificationError("Du bist nicht mehr angemeldet!")
            }

            const userAccount = await UserAccount.findById(decodedToken._id).populate('contact') as unknown as UserAccountDoc & { contact: UserContactDoc };

            if (!userAccount) {
                throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
            }

            let userPublicData = decodedToken;
            let newToken;

            // Compare decoded token 
            if (
                JSON.stringify(decodedToken.groups) !== JSON.stringify(userAccount.groups) ||
                JSON.stringify(decodedToken.domains) !== JSON.stringify(userAccount.domains) ||
                JSON.stringify(decodedToken.contact) !== JSON.stringify(userAccount.contact) ||
                decodedToken.authProvider !== userAccount.authProvider ||
                decodedToken.schacHomeOrganization !== schacHomeOrganizationFromPairwiseId(userAccount.pairwiseId)
            ) {
                userPublicData = normalizeUserData(userAccount);

                newToken = sign(userPublicData,
                    process.env.JWT_ENCRYPTION_KEY as string,
                    { expiresIn: req.client === REQ_CLIENT.MOBILE ? "7d" : "1h" }
                );

                await RedisClient.del("auth_invalidate_" + userAccount._id);

                if (req.client === REQ_CLIENT.WEB) {
                    setAuthCookie(res, newToken);
                }
            }

            if (req.client === REQ_CLIENT.WEB) {
                res.status(200).json(userPublicData);

            } else {
                res.status(200).json({
                    ...userPublicData,
                    authToken: newToken || token,
                    refreshToken: refreshToken
                });
            }
        }
    } catch (err) {
        if (req.client === REQ_CLIENT.WEB) {
            res.clearCookie('token');
        }
        next(err);
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.client === REQ_CLIENT.MOBILE ? req.headers.authorization?.substring(7) : req.cookies.token;
        if (!token) {
            throw new AuthentificationError("Du bist nicht mehr angemeldet!")
        }

        const decodedToken = verify(token, process.env.JWT_ENCRYPTION_KEY as string) as PublicUserAccountAndContact;

        if (!decodedToken) {
            throw new AuthentificationError("Du bist nicht mehr angemeldet!")
        }

        const userAccount = await UserAccount.findById(decodedToken._id).populate('contact') as unknown as UserAccountDoc & { contact: UserContactDoc };

        if (!userAccount) {
            throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
        }

        const userPublicData = normalizeUserData(userAccount);

        const newToken = sign(userPublicData,
            process.env.JWT_ENCRYPTION_KEY as string,
            { expiresIn: req.client === REQ_CLIENT.MOBILE ? "7d" : "1h" }
        );

        if (req.client === REQ_CLIENT.WEB) {

            setAuthCookie(res, newToken);

            res.status(200).json(userPublicData)
        } else {
            res.status(200).json({
                ...userPublicData,
                authToken: newToken,
                refreshToken: userAccount.refreshToken
            });
        }
    } catch (err) {
        next(err);
    }
}

export const logout = async (req: Request, res: Response) => {
    if (req.currentUser) {
        const userAccount = await UserAccount.findById(req.currentUser._id);
        if (userAccount) {
            userAccount.refreshToken = "";
            userAccount.refreshTokenExpire = new Date();
            if (req.client === REQ_CLIENT.MOBILE) {
                userAccount.devices = [];
                await userAccount.save();
            }
            await userAccount.save();
        }
    }
    if (req.client === REQ_CLIENT.WEB) {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        clearShibbolethSessionCookiesIfWeb(req, res);
        res.status(200).send("Du wurdest erfolgreich abgemeldet.");
        return;
    }
    res.status(200).send("Du wurdest erfolgreich abgemeldet.");
}

interface ResetPasswordRequest {
    mail: string;
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as ResetPasswordRequest;

        const userAccount = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${body.mail}$`, 'i') } // case-insensitive regex
        }).populate("contact") as unknown as UserAccountDoc & { contact: UserContactDoc };
        if (!userAccount) {
            throw new NotFoundError("Es konnte kein Benutzer mit dieser E-Mail-Adresse gefunden werden!");
        }

        if (userAccount.authProvider === AuthProvider.DFN_AAI) {
            throw new BadRequestError("Passwort-Reset ist für reinen Hochschul-Login nicht verfügbar.");
        }

        const resetToken = Math.random().toString(36).substring(7);
        userAccount.resetPasswordToken = resetToken;
        userAccount.resetPasswordExpires = new Date(Date.now() + 3600000);
        await userAccount.save();

        await sendBrevoTemplateMail(
            {
                to: [{ email: userAccount.mail }],
                templateId: 22,
                params: {
                    resetLink: `https://apps.univocal.de/reset-password/${resetToken}`
                }
            }
        )

        res.status(200).send("Wir haben dir eine E-Mail mit einem Link geschickt, auf den du klicken kannst, um dein Passwort zurückzusetzen!");
    } catch (err) {
        next(err);
    }
}

export const resetPasswordRepeatMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as ResetPasswordRequest;

        const userAccount = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${body.mail}$`, 'i') } // case-insensitive regex
        }).populate("contact") as unknown as UserAccountDoc & { contact: UserContactDoc };
        if (!userAccount) {
            throw new NotFoundError("Es konnte kein Benutzer mit dieser E-Mail-Adresse gefunden werden!");
        }

        if (!userAccount.resetPasswordToken) {
            throw new BadRequestError("Es wurde noch kein Passwort-Reset angefordert!");
        }

        if (userAccount.resetPasswordExpires! < new Date()) {
            throw new BadRequestError("Der Link ist abgelaufen!");
        }

        // Send email with reset token
        await sendBrevoTemplateMail(
            {
                to: [{ email: userAccount.mail }],
                templateId: 22,
                params: {
                    resetLink: `https://apps.univocal.de/reset-password/${userAccount.resetPasswordToken}`
                }
            }
        )

        res.status(200).send("Wir haben dir eine E-Mail mit einem Link geschickt, auf den du klicken kannst, um dein Passwort zurückzusetzen!");
    } catch (err) {
        next(err);
    }
}

interface ResetPasswordTokenRequest {
    password: string;
}

export const resetPasswordWithToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.params.token;
        const body = req.body as ResetPasswordTokenRequest;

        const userAccount = await UserAccount.findOne({ resetPasswordToken: token });
        if (!userAccount) {
            throw new BadRequestError("Der Link ist ungültig!");
        }

        if (userAccount.resetPasswordExpires! < new Date()) {
            throw new BadRequestError("Der Link ist abgelaufen!");
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        userAccount.password = hashedPassword;
        userAccount.resetPasswordToken = undefined;
        userAccount.resetPasswordExpires = undefined;
        await userAccount.save();

        res.status(200).send("Dein Passwort wurde erfolgreich zurückgesetzt!");
    } catch (err) {
        next(err);
    }
};

interface verifyMailRequest {
    token: string;
}

export const verifyMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let body = req.body as verifyMailRequest;

        const userAccount = await UserAccount.findOne({ activationToken: body.token });
        if (!userAccount || userAccount.activationToken !== body.token || !userAccount.activationToken) {
            throw new NotFoundError("Der Link ist ungültig!");
        }

        userAccount.activationStatus = ActivationStatus.ACTIVATED;
        userAccount.activationToken = undefined;

        await userAccount.save();

        res.status(200).send("Deine E-Mail-Adresse wurde erfolgreich bestätigt! Du kannst dich nun anmelden.");
    } catch (err) {
        next(err);
    }
}