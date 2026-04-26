"use client";

import {
	Alert,
	Button,
	Modal,
	Stack,
	Text,
	TextInput,
	Textarea,
} from "@mantine/core";
import { IconMailForward } from "@tabler/icons-react";
import { useState } from "react";
import { COLORS } from "../constants/Colors";

const TEXT = "#2d1b4e";

function saasOfferApiUrl(): string {
	const host = process.env.NEXT_PUBLIC_KUBERNETES_HOST?.replace(/\/$/, "") ?? "";
	return `${host}/api/tenant/public/saas-offer`;
}

type SaasOfferModalProps = {
	opened: boolean;
	onClose: () => void;
};

export function SaasOfferModal(props: SaasOfferModalProps) {
	const { opened, onClose } = props;
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [organization, setOrganization] = useState("");
	const [message, setMessage] = useState("");
	const [website, setWebsite] = useState("");

	const [fieldErrors, setFieldErrors] = useState<{
		name?: string;
		email?: string;
	}>({});

	const resetForm = () => {
		setName("");
		setEmail("");
		setOrganization("");
		setMessage("");
		setWebsite("");
		setFieldErrors({});
	};

	const handleClose = () => {
		setSubmitError(null);
		setSuccess(false);
		resetForm();
		onClose();
	};

	const validate = (): boolean => {
		const next: typeof fieldErrors = {};
		if (name.trim().length < 2) {
			next.name = "Bitte Namen angeben";
		}
		if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
			next.email = "Bitte gültige E-Mail angeben";
		}
		setFieldErrors(next);
		return Object.keys(next).length === 0;
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);
		if (!validate()) {
			return;
		}
		setSubmitting(true);
		const url = saasOfferApiUrl();
		if (!url.startsWith("http")) {
			setSubmitError("API-Basis-URL fehlt (NEXT_PUBLIC_KUBERNETES_HOST).");
			setSubmitting(false);
			return;
		}
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					organization: organization.trim(),
					message: message.trim(),
					website,
				}),
			});
			const data = (await res.json().catch(() => ({}))) as {
				error?: { message?: string } | string;
			};
			if (!res.ok) {
				const msg =
					typeof data.error === "object" && data.error?.message
						? data.error.message
						: typeof data.error === "string"
							? data.error
							: null;
				setSubmitError(
					msg ||
						"Senden fehlgeschlagen. Bitte später erneut versuchen.",
				);
				return;
			}
			setSuccess(true);
			resetForm();
		} catch {
			setSubmitError(
				"Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Text
					fw={700}
					c={COLORS.PRIMARY}
					size="lg"
				>
					SaaS-Angebot anfragen
				</Text>
			}
			centered
			radius="lg"
			size="md"
			styles={{
				header: { alignItems: "flex-start" },
			}}
		>
			{success ? (
				<Stack gap="md">
					<Alert
						color="teal"
						title="Gesendet"
					>
						Vielen Dank. Wir melden uns bei dir per E-Mail.
					</Alert>
					<Button
						onClick={handleClose}
						radius="xl"
						fullWidth
						variant="light"
						color={COLORS.PRIMARY}
					>
						Schließen
					</Button>
				</Stack>
			) : (
				<form onSubmit={onSubmit}>
					<Stack gap="md">
						{submitError && (
							<Alert
								color="red"
								title="Fehler"
							>
								{submitError}
							</Alert>
						)}
						<TextInput
							label="Name"
							placeholder="Vor- und Nachname"
							required
							styles={{ label: { color: TEXT } }}
							value={name}
							onChange={(e) => setName(e.currentTarget.value)}
							error={fieldErrors.name}
						/>
						<TextInput
							label="E-Mail"
							placeholder="du@hochschule.de"
							type="email"
							required
							styles={{ label: { color: TEXT } }}
							value={email}
							onChange={(e) => setEmail(e.currentTarget.value)}
							error={fieldErrors.email}
						/>
						<TextInput
							label="Hochschule oder Organisation (optional)"
							placeholder="z. B. Fachschaft …"
							styles={{ label: { color: TEXT } }}
							value={organization}
							onChange={(e) =>
								setOrganization(e.currentTarget.value)
							}
						/>
						<Textarea
							label="Nachricht (optional)"
							placeholder="Kurz beschreiben, was ihr braucht …"
							autosize
							minRows={3}
							maxRows={8}
							styles={{ label: { color: TEXT } }}
							value={message}
							onChange={(e) => setMessage(e.currentTarget.value)}
						/>
						<TextInput
							label="Website"
							placeholder=""
							style={{ display: "none" }}
							tabIndex={-1}
							autoComplete="off"
							value={website}
							onChange={(e) => setWebsite(e.currentTarget.value)}
						/>
						<Button
							type="submit"
							loading={submitting}
							radius="xl"
							fullWidth
							leftSection={
								<IconMailForward
									size={20}
									stroke={1.5}
								/>
							}
							styles={{
								root: {
									backgroundColor: COLORS.PRIMARY,
								},
							}}
							c="white"
						>
							Anfrage senden
						</Button>
					</Stack>
				</form>
			)}
		</Modal>
	);
}
