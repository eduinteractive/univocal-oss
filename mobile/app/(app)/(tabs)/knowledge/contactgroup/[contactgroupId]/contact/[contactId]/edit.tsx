import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Contact, deleteContact, getContactGroup, updateContact } from "@/api/Contact";
import { useTenant } from "@/context/TenantContext";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { applyColor, Button, Flex, TextInput, TextInputProps } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { MAIL_REGEX } from "@/constants/General";
import SVHLoader from "@/components/common/SVHLoader";
import { IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { contactgroupId, contactId } = useLocalSearchParams();
	const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    
	// --- State für alle Felder
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [description, setDescription] = useState("");

	// --- Refs für Fokushandling
	const firstNameRef = useRef<TextInputProps>(null);
	const lastNameRef = useRef<TextInputProps>(null);
	const emailRef = useRef<TextInputProps>(null);
	const phoneRef = useRef<TextInputProps>(null);
	const descriptionRef = useRef<TextInputProps>(null);

	const contactGroupQuery = useQuery({
		queryKey: ["contactGroup", currentTenant?._id, contactgroupId],
		queryFn: () =>
			getContactGroup({
				tenantId: currentTenant!._id,
				contactGroupId: contactgroupId as string,
				params: null,
			}),
		enabled: !!contactgroupId && !!currentTenant,
	});

    const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du diesen Kontakt wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteContact({
							tenantId: currentTenant!._id,
							contactId: contactId as string,
						});
						queryClient.invalidateQueries({
							queryKey: ["contactGroup", currentTenant?._id, contactgroupId],
						});
					} catch (error) {
						Alert.alert(
							"Fehler",
							"Der Kontakt konnte nicht gelöscht werden."
						);
					} finally {
						router.back();
					}
				},
			},
		]);
	};


    useLayoutEffect(() => {
		if (contactGroupQuery.data) {
			navigation.setOptions({
				headerRight: () => (
                    <HeaderMenu
                        options={[
                            { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                        ]}
                        onSelect={(value) => {
                            if (value === "delete") handleDelete();
                        }}
                    />
				),
			});
		}
	}, [contactGroupQuery.data, navigation]);

	useEffect(() => {
		if (contactGroupQuery.data) {
			const contact = contactGroupQuery.data.contacts.find(
				(c: Contact) => c._id === contactId
			);
			if (contact) {
				setFirstName(contact.firstName || "");
				setLastName(contact.lastName || "");
				setEmail(contact.email);
				setPhone(contact.phone || "");
				setDescription(contact.description || "");
			}
		}
	}, [contactGroupQuery.data, contactId]);

	const updateMutation = useMutation({
		mutationFn: updateContact,
		onSuccess: () => {
			NotificationHandler.showSuccess("Kontakt erfolgreich aktualisiert");
			queryClient.invalidateQueries({
				queryKey: ["contactGroup", currentTenant!._id, contactgroupId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = () => {
		if (!email.trim()) {
			return NotificationHandler.showError("Bitte gib eine E-Mail-Adresse ein.");
		}

		if (!MAIL_REGEX.test(email)) {
			return NotificationHandler.showError("Die E-Mail-Adresse ist nicht gültig");
		}

		setIsLoading(true);

		updateMutation
			.mutateAsync({
				tenantId: currentTenant!._id,
				contactId: contactId as string,
				body: {
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					email: email.trim(),
					phone: phone.trim(),
					description: description.trim(),
				},
			})
			.finally(() => setIsLoading(false));
	};

	if (contactGroupQuery.isLoading || !contactGroupQuery.data) {
		return <SVHLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1, backgroundColor: "white" }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<Flex
					direction="column"
					gap="lg"
					p="md"
				>
					<TextInput
						size="sm"
						label="Vorname"
						placeholder="Vorname eingeben..."
						value={firstName}
						onChangeText={(text) => setFirstName(text)}
						ref={firstNameRef as any}
						onSubmitEditing={() => (lastNameRef.current as any)?.focus()}
					/>

					<TextInput
						size="sm"
						label="Nachname"
						placeholder="Nachname eingeben..."
						value={lastName}
						onChangeText={(text) => setLastName(text)}
						ref={lastNameRef as any}
						onSubmitEditing={() => (emailRef.current as any)?.focus()}
					/>

					<TextInput
						size="sm"
						label="E-Mail-Adresse"
						placeholder="E-Mail-Adresse eingeben..."
						value={email}
						onChangeText={(text) => setEmail(text)}
						ref={emailRef as any}
						onSubmitEditing={() => (phoneRef.current as any)?.focus()}
						required
						keyboardType="email-address"
						autoCapitalize="none"
					/>

					<TextInput
						size="sm"
						label="Telefonnummer"
						placeholder="Telefonnummer eingeben..."
						value={phone}
						onChangeText={(text) => setPhone(text)}
						ref={phoneRef as any}
						onSubmitEditing={() => (descriptionRef.current as any)?.focus()}
						keyboardType="phone-pad"
					/>

					<TextInput
						size="sm"
						label="Beschreibung"
						placeholder="Beschreibung eingeben..."
						value={description}
						onChangeText={(text) => setDescription(text)}
						ref={descriptionRef as any}
						onSubmitEditing={() => Keyboard.dismiss()}
						multiline
						numberOfLines={4}
					/>

					<Button
						variant="filled"
						loading={isLoading}
						loadingText="Bitte warten..."
						onPress={handleSubmit}
						radius="xs"
					>
						Kontakt aktualisieren
					</Button>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
