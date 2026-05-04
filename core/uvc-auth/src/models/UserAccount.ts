import { Schema, Types, Document, model, Model } from "mongoose";
import { UserContactDoc } from "./UserContact";
import { GROUP_PERMISSION_LEVEL, PERMISSION_LEVEL } from "@eduinteractive/uvc-common";
import { schacHomeOrganizationFromSubjectId } from "../utils/schacHomeOrganizationFromSubjectId";

export enum ActivationStatus {
    NOT_VERIFIED = "NOT_VERIFIED",
    ACTIVATED = "ACTIVATED",
    BANNED = "BANNED",
}

/** How the account was created / primary login method. LOCAL users may later link DFN (subjectId set). */
export enum AuthProvider {
    LOCAL = "LOCAL",
    DFN_AAI = "DFN_AAI",
}

export interface PublicUserAccountAndContact {
    _id: Types.ObjectId;
    mail: string;
    permissionLevel: PERMISSION_LEVEL;
    groups: Groups[];
    domains: Types.ObjectId[];
    dataProtectionAgreement: boolean;
    activationStatus: ActivationStatus;
    authProvider?: AuthProvider;
    schacHomeOrganization?: string;
    refreshToken?: string;
    refreshTokenExpire?: Date;
    lastSignDate: Date;
    registerDate: Date;
    contact: UserContactDoc | Types.ObjectId;
}

interface Groups {
    _id: Types.ObjectId,
    permissionLevel: GROUP_PERMISSION_LEVEL,
}

interface UserAccountAttrs {
    mail: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    permissionLevel: PERMISSION_LEVEL;
    groups: Groups[];
    domains: Types.ObjectId[];
    dataProtectionAgreement: boolean;
    activationStatus: ActivationStatus;
    activationToken?: string;
    refreshToken?: string;
    refreshTokenExpire?: Date;
    lastSignDate: Date;
    registerDate: Date;
    contact: Types.ObjectId;
    devices: {
        pushToken: string;
    }[];
    authProvider?: AuthProvider;
    /** Stable DFN-AAI principal (SAML subject-id / Subject Identifier). */
    subjectId?: string;
}

interface UserAccountModel extends Model<UserAccountDoc> {
    build(attrs: UserAccountAttrs): UserAccountDoc;
    normalize(user: UserAccountDoc, contact: UserContactDoc): PublicUserAccountAndContact;
}

export interface UserAccountDoc extends Document {
    _id: Types.ObjectId;
    mail: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    permissionLevel: PERMISSION_LEVEL;
    groups: Groups[];
    domains: Types.ObjectId[];
    dataProtectionAgreement: boolean;
    activationStatus: ActivationStatus;
    activationToken?: string;
    refreshToken?: string;
    refreshTokenExpire?: Date;
    lastSignDate: Date;
    registerDate: Date;
    contact: Types.ObjectId;
    devices: {
        pushToken: string;
    }[];
    authProvider: AuthProvider;
    subjectId?: string;
    schacHomeOrganization?: string;
}

const UserAccountSchema = new Schema({
    mail: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
    permissionLevel: { type: Number, required: true },
    groups: { type: Array, required: true },
    domains: { type: [Types.ObjectId], required: true, default: [] },
    dataProtectionAgreement: { type: Boolean, required: true },
    activationStatus: { type: String, required: true, enum: ActivationStatus },
    activationToken: { type: String, required: false },
    refreshToken: { type: String, required: false },
    refreshTokenExpire: { type: Date, required: false },
    lastSignDate: { type: Date, required: true },
    registerDate: { type: Date, required: true },
    contact: { type: Types.ObjectId, ref: "UserContact", required: true },
    devices: {
        type: [{
            pushToken: { type: String, required: true },
        }],
        required: true,
        default: [],
        _id: false
    },
    authProvider: { type: String, required: true, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    subjectId: { type: String, required: false, unique: true, sparse: true },
});

UserAccountSchema.statics.build = (attrs: UserAccountAttrs) => {
    return new UserAccount(attrs);
}

UserAccountSchema.statics.normalize = (user: UserAccountDoc, contact?: UserContactDoc): PublicUserAccountAndContact => {
    return {
        _id: user._id,
        mail: user.mail,
        permissionLevel: user.permissionLevel,
        groups: user.groups,
        domains: user.domains,
        dataProtectionAgreement: user.dataProtectionAgreement,
        activationStatus: user.activationStatus,
        authProvider: user.authProvider,
        schacHomeOrganization: schacHomeOrganizationFromSubjectId(user.subjectId),
        lastSignDate: user.lastSignDate,
        registerDate: user.registerDate,
        contact: contact ? contact : user.contact
    }
}

const UserAccount = model<UserAccountDoc, UserAccountModel>("UserAccount", UserAccountSchema);

export default UserAccount;
