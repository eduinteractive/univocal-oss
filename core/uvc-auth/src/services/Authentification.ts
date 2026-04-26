import { Response } from "express"
import { UserAccountDoc } from "../models/UserAccount";
import { UserContactDoc } from "../models/UserContact";
import { schacHomeOrganizationFromPairwiseId } from "../utils/schacHomeOrganizationFromPairwiseId";

export const setAuthCookie = (res: Response, token: string, refreshToken?: string) => {
    if (process.env.ENVIRONMENT === "PRODUCTION") {
        res.cookie('token', token, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                expires: new Date(Date.now() + 604800000),
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
        }
    } else {
        res.cookie('token', token, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
        });
        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                expires: new Date(Date.now() + 604800000),
                httpOnly: true,
            });
        }
    }
}

export const normalizeUserData = (data: UserAccountDoc & { contact: UserContactDoc }) => {
    return {
        _id: data._id,
        mail: data.mail,
        permissionLevel: data.permissionLevel,
        groups: data.groups,
        domains: data.domains,
        dataProtectionAgreement: data.dataProtectionAgreement,
        activationStatus: data.activationStatus,
        authProvider: data.authProvider,
        schacHomeOrganization: schacHomeOrganizationFromPairwiseId(data.pairwiseId),
        lastSignDate: data.lastSignDate,
        registerDate: data.registerDate,
        contact: data.contact,
    }
}