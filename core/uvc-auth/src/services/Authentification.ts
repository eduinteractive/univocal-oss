import { Response } from "express"
import { UserAccountDoc } from "../models/UserAccount";
import { UserContactDoc } from "../models/UserContact";
import { schacHomeOrganizationFromSubjectId } from "../utils/schacHomeOrganizationFromSubjectId";

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

/** Session payload keeps authorization fields only. Display badges stay on the membership document. */
export const toSessionGroups = (
    groups: Array<{ _id: { toString(): string }; permissionLevel: number }>
) =>
    groups.map((group) => ({
        _id: group._id.toString(),
        permissionLevel: group.permissionLevel,
    }));

export const normalizeUserData = (data: UserAccountDoc & { contact: UserContactDoc }) => {
    return {
        _id: data._id,
        mail: data.mail,
        permissionLevel: data.permissionLevel,
        groups: data.groups.map(({ _id, permissionLevel }) => ({
            _id,
            permissionLevel,
        })),
        domains: data.domains,
        dataProtectionAgreement: data.dataProtectionAgreement,
        activationStatus: data.activationStatus,
        authProvider: data.authProvider,
        schacHomeOrganization: schacHomeOrganizationFromSubjectId(data.subjectId),
        lastSignDate: data.lastSignDate,
        registerDate: data.registerDate,
        contact: data.contact,
    }
}