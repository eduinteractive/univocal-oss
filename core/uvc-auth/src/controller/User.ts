import { NextFunction, Request, Response } from 'express';
import UserAccount, { ActivationStatus, UserAccountDoc } from '../models/UserAccount';
import UserContact, { UserContactDoc } from '../models/UserContact';
import bcrypt from "bcryptjs";
import { BadRequestError, ForbiddenError, NotFoundError, sendBrevoMail } from '@eduinteractive/uvc-common';
import { Types } from 'mongoose';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { expo, EXPO_TICKETS } from '../services/Notification';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserAccount.find({}).populate('contact') as unknown as (UserAccountDoc & { contact: UserContactDoc })[];
        const responseData = users.map((user) => {
            return {
                _id: user._id,
                mail: user.mail,
                firstName: user.contact.first_name,
                lastName: user.contact.last_name,
                groups: user.groups,
                activationStatus: user.activationStatus,
            }
        })
        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserAccount.findById(req.params.userId).populate('contact') as unknown as UserAccountDoc & { contact: UserContactDoc };
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        const responseData = {
            _id: user._id,
            firstName: user.contact.first_name,
            lastName: user.contact.last_name,
        }
        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
}

/** Admin: get one user with full details for administration. */
export const getAdminUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserAccount.findById(req.params.userId).populate('contact') as unknown as UserAccountDoc & { contact: UserContactDoc };
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        const responseData = {
            _id: user._id,
            mail: user.mail,
            firstName: user.contact.first_name,
            lastName: user.contact.last_name,
            groups: user.groups,
            activationStatus: user.activationStatus,
        };
        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
}

export const getUserEmailById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserAccount.findById(req.params.userId);
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        res.status(200).json({ email: user.mail });
    } catch (err) {
        next(err);
    }
}

interface changePasswordRequest {
    oldpassword: string;
    newpassword: string;
}

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as changePasswordRequest;

        const userAccount = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${req.currentUser?.mail}$`, 'i') } // case-insensitive regex
        });
        if (!userAccount) {
            throw new ForbiddenError("Das Passwort und der Benutzername stimmen nicht überein!");
        }

        const isPasswordValid = await bcrypt.compare(body.oldpassword, userAccount.password);
        if (!isPasswordValid) {
            throw new ForbiddenError("Das Passwort und der Benutzername stimmen nicht überein!");
        }

        const newPasswordHash = await bcrypt.hash(body.newpassword, 10);

        userAccount.password = newPasswordHash;
        userAccount.save();

        res.status(200).send("Das Passwort wurde erfolgreich geändert.")
    } catch (err) {
        next(err);
    }
}

interface updateUserRequest {
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateUserRequest;

        const userAccount = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${req.currentUser?.mail}$`, 'i') } // case-insensitive regex
        });
        if (!userAccount) {
            throw new ForbiddenError("Benutzer nicht gefunden");
        }

        const userContact = await UserContact.findOne({ _id: userAccount.contact });
        if (!userContact) {
            throw new ForbiddenError("Benutzerkontakt nicht gefunden");
        }

        await userAccount.save();
        await userContact.save();

        res.status(200).send("Die Kontaktdaten wurden erfolgreich geändert.")
    } catch (err) {
        next(err)
    }
}

interface updateUserPushTokenRequest {
    pushToken: string;
}

export const updateUserPushToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateUserPushTokenRequest;

        const userAccount = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${req.currentUser?.mail}$`, 'i') } // case-insensitive regex
        });
        if (!userAccount) {
            throw new ForbiddenError("Benutzer nicht gefunden");
        }

        if (!userAccount.devices.find((device) => device.pushToken === body.pushToken)) {
            userAccount.devices.push({
                pushToken: body.pushToken,
            });
        }

        await userAccount.save();

        res.status(200).send("Der Push Token wurde erfolgreich aktualisiert.");
    } catch (err) {
        next(err);
    }
}

/** USERS */

export const getUsersByIds = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserAccount.find({ _id: { $in: req.body.userIds.map((userId: string) => new Types.ObjectId(userId as string)) } }).populate('contact') as unknown as (UserAccountDoc & { contact: UserContactDoc })[];
        const responseData = users.map((user) => {
            return {
                _id: user._id,
                firstName: user.contact.first_name,
                lastName: user.contact.last_name,
                devices: user.devices,
            }
        })
        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
}

interface isMailExistingRequest {
    mail: string;
}

export const isMailExisting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as isMailExistingRequest;
        const user = await UserAccount.findOne({ mail: { $regex: new RegExp(`^${body.mail}$`, 'i') } });
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        res.status(200).json(true);
    } catch (err) {
        next(err);
    }
}

export interface sendPushNotificationRequest {
    userId?: string;
    userIds?: string[];
    groupId?: string;
    permissionLevel?: number;
    title: string;
    message: string;
}

export const sendPushNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as sendPushNotificationRequest;

        if (body.groupId) {
            let users = await UserAccount.find({ groups: { $elemMatch: { _id: new Types.ObjectId(body.groupId) } } });
            if (body.permissionLevel) {
                users = users.filter((user) => user.groups.find((group) => group._id.toString() === body.groupId!.toString())!.permissionLevel >= body.permissionLevel!);
            }

            const messages = [];
            for (const user of users) {
                if (user._id.toString() !== req.currentUser?._id.toString()) {

                    for (const device of user.devices) {
                        let pushToken = `ExponentPushToken[${device.pushToken}]`;
                        if (!Expo.isExpoPushToken(pushToken)) {
                            console.log(pushToken);
                            continue;
                        }
                        messages.push({
                            to: pushToken,
                            sound: 'default',
                            title: body.title,
                            body: body.message,
                        });
                    }
                }
            }
            let chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                EXPO_TICKETS.push(...ticketChunk);
            }

            return res.status(200).send("Die Benachrichtigung wurde erfolgreich gesendet.");
        } else if (body.userId) {
            const user = await UserAccount.findById(body.userId);
            if (!user || user.devices.length === 0) {
                throw new NotFoundError("Benutzer nicht gefunden oder keine Geräte gefunden");
            }
            const messages = user.devices.map((device) => {
                let pushToken = `ExponentPushToken[${device.pushToken}]`;
                if (!Expo.isExpoPushToken(pushToken)) {
                    return null;
                }
                return {
                    to: pushToken,
                    sound: 'default',
                    title: body.title,
                    body: body.message,
                }
            }).filter((message) => message !== null);

            let chunks = expo.chunkPushNotifications(messages as ExpoPushMessage[]);
            for (const chunk of chunks) {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                EXPO_TICKETS.push(...ticketChunk);
            }

            return res.status(200).send("Die Benachrichtigung wurde erfolgreich gesendet.");

        } else if (body.userIds) {
            const users = await UserAccount.find({ _id: { $in: req.body.userIds.map((userId: string) => new Types.ObjectId(userId as string)) } })

            const messages = [];
            for (const user of users) {
                for (const device of user.devices) {
                    let pushToken = `ExponentPushToken[${device.pushToken}]`;
                    if (!Expo.isExpoPushToken(pushToken)) {
                        continue;
                    }
                    messages.push({
                        to: pushToken,
                        sound: 'default',
                        title: body.title,
                        body: body.message,
                    });
                }
            }

            let chunks = expo.chunkPushNotifications(messages as ExpoPushMessage[]);
            for (const chunk of chunks) {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                EXPO_TICKETS.push(...ticketChunk);
            }

            return res.status(200).send("Die Benachrichtigung wurde erfolgreich gesendet.");

        }
        throw new BadRequestError("Kein Benutzer oder Gruppe angegeben");
    } catch (err) {
        next(err);
    }
}

export const banUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string;
        const user = await UserAccount.findById(userId);
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        user.activationStatus = ActivationStatus.BANNED;
        await user.save();
        res.status(200).send("Der Benutzer wurde erfolgreich gebannt.");
    } catch (err) {
        next(err);
    }
}

export const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string;
        const user = await UserAccount.findById(userId);
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        user.activationStatus = ActivationStatus.ACTIVATED;
        await user.save();
        res.status(200).send("Der Benutzer wurde erfolgreich entsperrt.");
    } catch (err) {
        next(err);
    }
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export const requestAccountDeletion = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const website = req.body?.website as string | undefined;
		if (website && String(website).trim() !== "") {
			return res.status(200).json({ ok: true });
		}

		const email = String(req.body?.email ?? "").trim();

		const toEmail =
			process.env.SUPPORT_EMAIL?.trim() ||
			process.env.SAAS_OFFER_TO_EMAIL?.trim() ||
			"sales@saukels.de";

		const htmlContent = `
<p><strong>Kontolöschung angefordert (univocal Landing)</strong></p>
<p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
<p>Bitte prüfe, ob ein Konto mit dieser E-Mail existiert, und bearbeite die Löschung manuell.</p>
`.trim();

		await sendBrevoMail({
			to: [{ email: toEmail }],
			subject: `[Univocal] Kontolöschung angefordert: ${email}`,
			html: htmlContent,
			replyTo: { email },
		});

		res.status(200).json({ ok: true });
	} catch (err) {
		next(err);
	}
};