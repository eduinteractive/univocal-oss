import { Request, Response, NextFunction } from "express";
import { sendBrevoMail } from "@eduinteractive/uvc-common";

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export const postSaasOffer = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const website = req.body?.website as string | undefined;
		if (website && String(website).trim() !== "") {
			return res.status(200).json({ ok: true });
		}

		const name = String(req.body?.name ?? "").trim();
		const email = String(req.body?.email ?? "").trim();
		const organization = String(req.body?.organization ?? "").trim();
		const message = String(req.body?.message ?? "").trim();

		const toEmail =
			process.env.SAAS_OFFER_TO_EMAIL?.trim() || "sales@saukels.de";
		const subject = organization
			? `univocal SaaS-Anfrage: ${organization}`
			: `univocal SaaS-Anfrage (${name})`;
		const htmlContent = `
<p><strong>Neue SaaS-Anfrage (univocal Landing)</strong></p>
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
<p><strong>Hochschule / Organisation:</strong> ${escapeHtml(organization || "(keine Angabe)")}</p>
<p><strong>Nachricht:</strong><br/>${escapeHtml(message || "(keine)")}</p>
`.trim();

		await sendBrevoMail({
			to: [{ email: toEmail }],
			subject,
			html: htmlContent,
			replyTo: { email, name },
		});

		res.status(200).json({ ok: true });
	} catch (err) {
		next(err);
	}
};
