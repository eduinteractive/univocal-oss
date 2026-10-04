import { Brevo, BrevoClient } from "@getbrevo/brevo";

const getBrevoClient = () => new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

interface sendBrevoTemplateMailRequest {
    to: {
        email: string;
    }[],
    templateId: number;
    params: Record<string, string>;
}

export const sendBrevoTemplateMail = async (req: sendBrevoTemplateMailRequest): Promise<Brevo.SendTransacEmailResponse> => {
    try {
        const mail = await getBrevoClient().transactionalEmails.sendTransacEmail({
            to: req.to,
            templateId: req.templateId,
            params: req.params
        });
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

export const sendBrevoMail = async (req: sendBrevoMail): Promise<Brevo.SendTransacEmailResponse> => {
    try {
        const mail = await getBrevoClient().transactionalEmails.sendTransacEmail({
            to: req.to,
            subject: req.subject,
            htmlContent: req.html,
            sender: { name: "Univocal", email: "noreply@education-interactive.de" },
            ...(req.replyTo
                ? { replyTo: { email: req.replyTo.email, name: req.replyTo.name } }
                : {}),
        });
        return mail;
    } catch (err) {
        throw err;
    }
}
