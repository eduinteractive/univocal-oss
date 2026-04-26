import { Request, Response, NextFunction } from "express";
import Report, { ReportAction, ReportStatus, ReportType } from "../models/Report";
import { NetworkAxios, NotFoundError, sendBrevoTemplateMail } from "@eduinteractive/uvc-common";
import PrivateMessage, { PrivateMessageDoc } from "../models/PrivateMessage";
import GroupMessage, { GroupMessageDoc } from "../models/GroupMessage";
import { decrypt } from "../utils/encryption";

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await Report.find();
        res.status(200).json(reports);
    } catch (err) {
        next(err);
    }
}

export const getReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reportId = req.params.reportId;
        const report = await Report.findById(reportId);
        if (!report) {
            throw new NotFoundError("Es wurde keine Meldung mit dieser ID gefunden.");
        }
        let message: PrivateMessageDoc | GroupMessageDoc | null = null;
        if (report.type === ReportType.PRIVATE_MESSAGE) {
            message = await PrivateMessage.findById(report.messageId);
        } else if (report.type === ReportType.GROUP_MESSAGE) {
            message = await GroupMessage.findById(report.messageId);
        }
        if (!message) {
            throw new NotFoundError("Es wurde keine Nachricht mit dieser ID gefunden.");
        }
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';

        const decryptedMessage = message ? decrypt(message.content, encryptionKey) : '';

        res.status(200).json({
            ...report.toObject(),
            message: decryptedMessage,
        });
    } catch (err) {
        next(err);
    }
}

interface updateReportRequest {
    action: ReportAction;
    reason?: string;
}

export const updateReportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reportId = req.params.reportId as string;
        const body = req.body as updateReportRequest;
        const report = await Report.findById(reportId);
        if (!report) {
            throw new NotFoundError("Es wurde keine Meldung mit dieser ID gefunden.");
        }
        if (body.action !== null) {
            report.set({
                action: body.action,
                reason: body.reason,
            });
        }
        let message: PrivateMessageDoc | GroupMessageDoc | null = null;
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || "";

        if (body.action === ReportAction.BAN || body.action === ReportAction.DELETE || body.action === ReportAction.WARNING) {
            report.set({
                status: ReportStatus.RESOLVED,
            });
            if (report.type === ReportType.PRIVATE_MESSAGE) {
                message = await PrivateMessage.findById(report.messageId);
            } else if (report.type === ReportType.GROUP_MESSAGE) {
                message = await GroupMessage.findById(report.messageId);
            }
            if (message) {
                const decryptedContent = decrypt(message.content, encryptionKey);
                report.set({ originalMessageContent: decryptedContent });
                message.content = "Diese Nachricht wurde von eine*r Moderator*in entfernt.";
                await message.save();
            }
        }

        let authorEmail: string | null = null;
        if (message && (body.action === ReportAction.BAN || body.action === ReportAction.WARNING)) {
            try {
                const emailRes = await NetworkAxios.get<{ email: string }>(
                    `http://uvc-auth-srv:3001/api/auth/network/user/${message.authorId.toString()}/email`
                );
                authorEmail = emailRes.data?.email ?? null;
            } catch {
                authorEmail = null;
            }
        }

        if (body.action === ReportAction.BAN && message) {
            await NetworkAxios.post(`http://uvc-auth-srv:3001/api/auth/network/user/${message.authorId}/ban`);
            if (authorEmail) {
                await sendBrevoTemplateMail({
                    to: [{ email: authorEmail }],
                    templateId: 24,
                    params: {
                        reason: body.reason ?? "",
                    },
                });
            }
        }
        if (body.action === ReportAction.WARNING && message && authorEmail) {
            await sendBrevoTemplateMail({
                to: [{ email: authorEmail }],
                templateId: 25,
                params: {
                    reason: body.reason ?? "",
                },
            });
        }
        await report.save();
        res.status(200).json(report);
    } catch (err) {
        next(err);
    }
}