import { useMemo, useState } from "react";
import { Button, Flex, Select, Text, TextInput } from "@eduinteractive/balladui";
import * as DocumentPicker from "expo-document-picker";
import dayjs from "dayjs";
import {
	BudgetPosition,
	BudgetPositionType,
	BudgetReceipt,
	ReceiptFileUpload,
} from "@/api/Budget";
import { IconFiles, IconTrash } from "@/assets/icons/Icon";
import { applyColor } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";

export type BudgetReceiptFormSubmit = {
	positionId?: string;
	amount: number;
	description?: string;
	date: Date;
	file?: { title: string; link: string; mimetype: string };
	newFile?: ReceiptFileUpload;
};

interface BudgetReceiptFormProps {
	data?: BudgetReceipt | null;
	positions: BudgetPosition[];
	loading?: boolean;
	onSubmit: (body: BudgetReceiptFormSubmit) => void;
}

const BudgetReceiptForm = ({
	data,
	positions,
	loading,
	onSubmit,
}: BudgetReceiptFormProps) => {
	const isEdit = !!data;

	const [positionId, setPositionId] = useState<string | null>(() => {
		if (!data) return null;
		const position = positions.find((p) => p._id === data.positionId);
		return position && !position.without_assignment ? data.positionId : null;
	});
	const [amount, setAmount] = useState(
		data ? String(data.amount).replace(".", ",") : ""
	);
	const [description, setDescription] = useState(data?.description || "");
	const [dateText, setDateText] = useState(
		data?.date ? dayjs(data.date).format("DD.MM.YYYY") : dayjs().format("DD.MM.YYYY")
	);
	const [newFile, setNewFile] = useState<ReceiptFileUpload | undefined>();
	const [file, setFile] = useState<
		{ title: string; link: string; mimetype: string } | undefined
	>(data?.file || undefined);

	const positionOptions = useMemo(() => {
		const groups = positions.filter(
			(p) =>
				p.type === BudgetPositionType.GROUP_INCOME ||
				p.type === BudgetPositionType.GROUP_EXPENSE
		);

		const toOption = (position: BudgetPosition) => {
			const group = groups.find((g) => g._id === position.parent);
			return {
				value: position._id,
				label: group
					? `${group.title} › ${position.title}`
					: position.title,
			};
		};

		const sortByLabel = (a: { label: string }, b: { label: string }) =>
			a.label.localeCompare(b.label, "de");

		const incomeItems = positions
			.filter(
				(p) =>
					p.type === BudgetPositionType.INCOME &&
					p.parent &&
					!p.without_assignment
			)
			.map(toOption)
			.sort(sortByLabel);

		const expenseItems = positions
			.filter(
				(p) =>
					p.type === BudgetPositionType.EXPENSE &&
					p.parent &&
					!p.without_assignment
			)
			.map(toOption)
			.sort(sortByLabel);

		return [
			...incomeItems.map((item) => ({
				...item,
				label: `Einnahme: ${item.label}`,
			})),
			...expenseItems.map((item) => ({
				...item,
				label: `Ausgabe: ${item.label}`,
			})),
		];
	}, [positions]);

	const handlePickFile = async () => {
		const result = await DocumentPicker.getDocumentAsync({
			type: "*/*",
			copyToCacheDirectory: true,
			multiple: false,
		});
		if (!result.canceled && result.assets?.[0]) {
			const asset = result.assets[0];
			setNewFile({
				uri: asset.uri,
				name: asset.name,
				type: asset.mimeType || "application/octet-stream",
			});
			setFile(undefined);
		}
	};

	const handleRemoveFile = () => {
		setNewFile(undefined);
		setFile(undefined);
	};

	const handleSubmit = () => {
		const amountNum = parseFloat(amount.replace(",", "."));
		if (isNaN(amountNum) || amountNum < 0) {
			return NotificationHandler.showError("Bitte gebe einen gültigen Betrag ein");
		}

		const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(dateText.trim());
		if (!match) {
			return NotificationHandler.showError(
				"Bitte gebe ein gültiges Datum im Format TT.MM.JJJJ ein"
			);
		}
		const parsedDate = dayjs(
			`${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`
		);
		if (!parsedDate.isValid()) {
			return NotificationHandler.showError(
				"Bitte gebe ein gültiges Datum im Format TT.MM.JJJJ ein"
			);
		}

		const resolvedPositionId = positionId || data?.positionId || undefined;
		if (isEdit && !resolvedPositionId) {
			return NotificationHandler.showError("Bitte wähle eine Position");
		}

		onSubmit({
			positionId: resolvedPositionId,
			amount: Math.round((amountNum + Number.EPSILON) * 100) / 100,
			description: description.trim() || undefined,
			date: parsedDate.toDate(),
			file: file || undefined,
			newFile,
		});
	};

	return (
		<Flex direction="column" gap="lg" p="md" pb={250}>
			<TextInput
				size="sm"
				label="Betrag (€)"
				placeholder="0,00"
				value={amount}
				onChangeText={setAmount}
				keyboardType="decimal-pad"
				required
			/>

			<TextInput
				size="sm"
				label="Datum"
				placeholder="TT.MM.JJJJ"
				value={dateText}
				onChangeText={setDateText}
				required
			/>

			<Select
				size="sm"
				label="Position"
				placeholder="Optional – Position wählen"
				options={positionOptions}
				value={positionId || undefined}
				onChange={(value) => setPositionId(value || null)}
			/>

			<TextInput
				size="sm"
				label="Beschreibung"
				placeholder="Beschreibung eingeben..."
				value={description}
				onChangeText={setDescription}
				multiline
				numberOfLines={3}
			/>

			{newFile || file ? (
				<Flex
					direction="row"
					align="center"
					justify="space-between"
					gap="sm"
				>
					<Text flex={1} numberOfLines={1}>
						{newFile?.name || file?.title}
					</Text>
					<Button variant="subtle" size="sm" onPress={handleRemoveFile}>
						<IconTrash size={18} color={applyColor("red")} />
					</Button>
				</Flex>
			) : (
				<Button
					variant="outline"
					size="sm"
					color="black"
					onPress={handlePickFile}
					style={{ borderWidth: 2 }}
				>
					<IconFiles size={16} />
					Datei hinzufügen
				</Button>
			)}

			<Button
				variant="filled"
				loading={loading}
				loadingText="Bitte warten..."
				onPress={handleSubmit}
				radius="xs"
			>
				{isEdit ? "Beleg aktualisieren" : "Beleg erstellen"}
			</Button>
		</Flex>
	);
};

export default BudgetReceiptForm;
