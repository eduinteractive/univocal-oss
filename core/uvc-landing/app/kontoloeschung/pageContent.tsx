"use client";

import {
	Alert,
	Button,
	Container,
	Paper,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { IconMailForward } from "@tabler/icons-react";
import { useState } from "react";
import { COLORS } from "../../constants/Colors";
import UVCHero from "../../components/UVCHero";

const TEXT = "#2d1b4e";

function accountDeletionApiUrl(): string {
	const host = process.env.NEXT_PUBLIC_KUBERNETES_HOST?.replace(/\/$/, "") ?? "";
	return `${host}/api/auth/public/account-deletion`;
}

const AccountDeletion = () => {
	const [email, setEmail] = useState("");
	const [website, setWebsite] = useState("");
	const [emailError, setEmailError] = useState<string | undefined>();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);

	const validate = (): boolean => {
		if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
			setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
			return false;
		}
		setEmailError(undefined);
		return true;
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);
		if (!validate()) {
			return;
		}

		const url = accountDeletionApiUrl();
		if (!url.startsWith("http")) {
			setSubmitError("API-Basis-URL fehlt (NEXT_PUBLIC_KUBERNETES_HOST).");
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					email: email.trim(),
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
			setEmail("");
			setWebsite("");
		} catch {
			setSubmitError(
				"Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<UVCHero
				title="Kontolöschung"
				content=""
				justify="center"
			/>
			<Container
				size="sm"
				py="xl"
			>
				<Stack gap="lg">
					<Text
						c={TEXT}
						size="md"
						ta="justify"
					>
						Es tut uns leid, dass du dein Konto löschen möchtest. Bevor du
						fortfährst, beachte bitte, dass durch die Löschung alle deine Daten
						und Einstellungen dauerhaft entfernt werden. Die Inhalte in deiner
						Gruppe werden nicht gelöscht und stattdessen an den
						Administrator*in übertragen. Dieser Vorgang kann nicht rückgängig
						gemacht werden.
					</Text>
					<Text
						c={TEXT}
						size="md"
						ta="justify"
					>
						Wenn du dein Konto dennoch löschen möchtest, fülle das untenstehende
						Formular aus.
					</Text>

					<Paper
						withBorder
						shadow="sm"
						p="lg"
						radius="lg"
					>
						{success ? (
							<Alert
								color="teal"
								title="Anfrage gesendet"
							>
								Vielen Dank. Wir haben deine Anfrage erhalten und melden uns per
								E-Mail, sobald dein Konto gelöscht wurde.
							</Alert>
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
										label="E-Mail"
										placeholder="E-Mail"
										type="email"
										required
										styles={{ label: { color: TEXT } }}
										value={email}
										onChange={(e) => setEmail(e.currentTarget.value)}
										error={emailError}
									/>
									<TextInput
										label="Website"
										placeholder=""
										style={{ display: "none" }}
										tabIndex={-1}
										autoComplete="off"
										value={website}
										onChange={(e) =>
											setWebsite(e.currentTarget.value)
										}
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
										Senden
									</Button>
								</Stack>
							</form>
						)}
					</Paper>
				</Stack>
			</Container>
		</>
	);
};

export default AccountDeletion;
