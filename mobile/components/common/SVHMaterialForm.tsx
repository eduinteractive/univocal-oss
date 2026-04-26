import React from "react";
import { Box, Button } from "@eduinteractive/balladui";
import * as DocumentPicker from "expo-document-picker";
import SVHMaterials from "./SVHMaterials";
import { IconFiles } from "@/assets/icons/Icon";

export interface Material {
	title: string;
	link: string;
	mimetype: string;
}

export interface SVHMaterialFormProps {
	materials: Material[];
	setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
	newUploads: any[];
	setNewUploads: React.Dispatch<React.SetStateAction<any[]>>;
}

const SVHMaterialForm: React.FC<SVHMaterialFormProps> = ({ materials, setMaterials, newUploads, setNewUploads }) => {
	const handlePickFile = async () => {
		const result = await DocumentPicker.getDocumentAsync({
			type: "*/*",
			copyToCacheDirectory: true,
			multiple: true,
		});
		if (!result.canceled && result.assets) {
			setNewUploads([
				...result.assets.map((asset) => ({
					uri: asset.uri,
					name: asset.name,
					type: asset.mimeType || "application/octet-stream",
				})),
			]);
		}
	};

	const handleRemoveMaterial = (link: string) => {
		setMaterials((prev) => prev.filter((material) => material.link !== link));
	};

	return (
		<Box>
			<Button
				variant="outline"
				size="sm"
				color="black"
				onPress={handlePickFile}
				style={{ borderWidth: 2 }}
                mb="sm"
			>
				<IconFiles
					size={16}
				/>
				{newUploads.length === 0
					? "Datei hinzufügen"
					: `${newUploads.length} Dateien hinzufügen`}
			</Button>
			<SVHMaterials
				isForm
				materials={materials}
				onPress={(material) => handleRemoveMaterial(material.link)}
			/>
		</Box>
	);
};

export default SVHMaterialForm;
