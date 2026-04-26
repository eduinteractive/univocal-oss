import { NotificationHandler } from "@/utils/NotificationHandler";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import SVHViewAccessSelect from "./SVHViewAccessSelect";
import { Button, Flex, TextInput, TextInputProps } from "@eduinteractive/balladui";

export interface SVHMetaFormSubmit {
	title: string;
	description?: string;
	viewAccess: number;
}

interface SVHMetaFormProps {
	after?: ReactNode;
	before?: ReactNode;
	children?: ReactNode;
	config?: {
		viewAccess?: boolean;
		textEditor?: boolean;
	};
	data: SVHMetaFormSubmit | null;
	loading?: boolean;
	onSubmit: (data: SVHMetaFormSubmit) => void;
}

const SVHMetaForm = (props: SVHMetaFormProps) => {
	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [viewAccess, setViewAccess] = useState<number>(0);

	const titleRef = useRef<TextInputProps>(null);
	const descriptionRef = useRef<TextInputProps>(null);

	useEffect(() => {
		if (props.data) {
			setTitle(props.data.title);
			setDescription(props.data.description || "");
			setViewAccess(props.data.viewAccess || 0);
		} else {
			setTitle("");
			setDescription("");
			setViewAccess(0);
		}
	}, [props.data]);

	const handleSubmit = () => {
		if (!title) {
			return NotificationHandler.showError("Bitte gebe einen Titel ein");
		}

		props.onSubmit({
			title: title,
			description: description,
			viewAccess: viewAccess,
		});
	};

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
						label="Titel"
						placeholder="Titel eingeben..."
						value={title}
						onChangeText={(text) => setTitle(text)}
						ref={titleRef as any}
						onSubmitEditing={() => Keyboard.dismiss()}
						required
					/>

					{props.before}

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

					{props.children}

					<SVHViewAccessSelect
						initial={props.data?.viewAccess || null}
						value={viewAccess}
						onChange={(value) => setViewAccess(value)}
					/>

					{props.after}

					<Button
						variant="filled"
						loading={props.loading}
						loadingText="Bitte warten..."
						onPress={handleSubmit}
						radius="xs"
					>
						Absenden
					</Button>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default SVHMetaForm;
