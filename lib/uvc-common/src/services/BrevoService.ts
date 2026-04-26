import { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";

interface sendBrevoTemplateMailRequest {
    to: {
        email: string;
    }[],
    templateId: number;
    params: Record<string, string>;
}

export const sendBrevoTemplateMail = async (req: sendBrevoTemplateMailRequest) => {
    try {
        let mailNotification = new SendSmtpEmail();
        mailNotification = {
            to: req.to,
            templateId: req.templateId,
            params: req.params
        }

        let apiInstance = new TransactionalEmailsApi();
        apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);
        const mail = await apiInstance.sendTransacEmail(mailNotification);
        return mail;
    } catch (err) {
        throw err;
    }
}


interface sendBrevoMail {
    to: {
        email: string;
    }[],
    subject: string;
    html: string;
    replyTo?: { email: string; name?: string };
}

export const sendBrevoMail = async (req: sendBrevoMail) => {
    try {
        let mailNotification = new SendSmtpEmail();
        mailNotification = {
            to: req.to,
            subject: req.subject,
            htmlContent: req.html,
            sender: { name: "Univocal", email: "noreply@education-interactive.de" },
            ...(req.replyTo
                ? { replyTo: { email: req.replyTo.email, name: req.replyTo.name } }
                : {}),
        }
        let apiInstance = new TransactionalEmailsApi();
        apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);
        const mail = await apiInstance.sendTransacEmail(mailNotification);
        return mail;
    } catch (err) {
        throw err;
    }
}