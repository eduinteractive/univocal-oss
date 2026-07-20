import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/api/Profile";
import { useTenant } from "@/context/TenantContext";
import UVCLoader from "@/components/common/UVCLoader";
import { useEffect, useState } from "react";
import { Button, Flex, TextInput } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";

const ProfileEditScreen = () => {
    const { currentTenant } = useTenant();
    const queryClient = useQueryClient();

    const [description, setDescription] = useState<string>("");
    const [contactPerson, setContactPerson] = useState<string>("");
    const [contactEmail, setContactEmail] = useState<string>("");
    const [contactPhone, setContactPhone] = useState<string>("");
    const [contactWebsite, setContactWebsite] = useState<string>("");
    const [publicPerson, setPublicPerson] = useState<string>("");

    const profileQuery = useQuery({
        queryKey: ["profile", currentTenant?.tenant!._id],
        queryFn: () => getProfile(currentTenant!.tenant!._id),
        enabled: !!currentTenant?.tenant?._id,
    });

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            NotificationHandler.showSuccess("Profil erfolgreich aktualisiert");
            queryClient.invalidateQueries({ queryKey: ["profile", currentTenant?.tenant!._id] });
            router.back();
        },
        onError: (error) => {
            NotificationHandler.showError("Fehler beim Aktualisieren des Profils");
            console.error("Profile update error:", error);
        },
    });

    useEffect(() => {
        if (profileQuery.data?.profile) {
            const profile = profileQuery.data.profile;
            setDescription(profile.description || "");
            setContactPerson(profile.contactPerson || "");
            setContactEmail(profile.contactEmail || "");
            setContactPhone(profile.contactPhone || "");
            setContactWebsite(profile.contactWebsite || "");
            setPublicPerson(profile.publicPerson || "");
        }
    }, [profileQuery.data]);

    const handleSubmit = () => {
        if (!currentTenant?.tenant?._id) {
            return NotificationHandler.showError("Kein Tenant ausgewählt");
        }

        updateMutation.mutate({
            tenantId: currentTenant.tenant._id,
            body: {
                description: description || "",
                contactPerson: contactPerson || "",
                contactEmail: contactEmail || "",
                contactPhone: contactPhone || "",
                contactWebsite: contactWebsite || "",
                publicPerson: publicPerson || "",
                avatarImage: profileQuery.data?.profile?.avatarImage || "",
            },
        });
    };

    if (profileQuery.isLoading) {
        return <UVCLoader />;
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, flexGrow: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ScrollView
                style={{ backgroundColor: "white" }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <Flex
                    direction="column"
                    gap="lg"
                    p="md"
                    pb={250}
                >
                    <TextInput
                        size="sm"
                        label="Beschreibung"
                        placeholder="Beschreibung der Gruppe eingeben..."
                        value={description}
                        onChangeText={(text) => setDescription(text)}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        multiline
                        numberOfLines={4}
                    />

                    <TextInput
                        size="sm"
                        label="Kontakt: Ansprechpartner*in"
                        placeholder="Name der Ansprechpartner*in eingeben..."
                        value={contactPerson}
                        onChangeText={(text) => setContactPerson(text)}
                        onSubmitEditing={() => Keyboard.dismiss()}
                    />

                    <TextInput
                        size="sm"
                        label="Kontakt: E-Mail"
                        placeholder="E-Mail-Adresse eingeben..."
                        value={contactEmail}
                        onChangeText={(text) => setContactEmail(text)}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        size="sm"
                        label="Kontakt Telefon"
                        placeholder="Telefonnummer eingeben..."
                        value={contactPhone}
                        onChangeText={(text) => setContactPhone(text)}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        keyboardType="phone-pad"
                    />

                    <TextInput
                        size="sm"
                        label="Kontakt: Website"
                        placeholder="Website-URL eingeben..."
                        value={contactWebsite}
                        onChangeText={(text) => setContactWebsite(text)}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        keyboardType="url"
                        autoCapitalize="none"
                    />

                    <TextInput
                        size="sm"
                        label="Pressesprecher*in"
                        placeholder="Name des*der Pressesprecher*in eingeben..."
                        value={publicPerson}
                        onChangeText={(text) => setPublicPerson(text)}
                        onSubmitEditing={() => Keyboard.dismiss()}
                    />

                    <Button
                        variant="filled"
                        loading={updateMutation.isPending}
                        loadingText="Bitte warten..."
                        onPress={handleSubmit}
                        radius="xs"
                    >
                        Profil speichern
                    </Button>
                </Flex>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ProfileEditScreen;
