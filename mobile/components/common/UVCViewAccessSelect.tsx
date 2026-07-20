import { useEffect, useState } from "react";
import { getGroupPermissionOptions } from "@/utils/Parser";
import { Alert } from "react-native";
import { Select } from "@eduinteractive/balladui";

interface UVCViewAccessSelectProps {
	initial: number | null;
	value: number;
	onChange: (value: number) => void;
}

const UVCViewAccessSelect = (props: UVCViewAccessSelectProps) => {
	const [newValue, setNewValue] = useState<null | number>(null);

	useEffect(() => {
		if (props.initial && newValue && props.initial < newValue) {
			Alert.alert(
				"Achtung",
				"Achtung: Mit dieser Änderung wird die Sichtbarkeit verringert. Dies kann dazu führen, dass einige Nutzer*innen nicht mehr auf die Daten zugreifen können. Überlege dir gut, ob du diese Änderung durchführen möchtest.",
				[
					{
						text: "Abbrechen",
						onPress: () => setNewValue(null),
						style: "cancel",
					},
					{
						text: "Ändern",
						onPress: () => {
							props.onChange(newValue);
							setNewValue(null);
						},
					},
				]
			);
		} else if (props.initial && newValue && props.initial > newValue) {
			Alert.alert(
				"Achtung",
				"Achtung: Mit dieser Änderung wird die Sichtbarkeit erhöht. Dies kann dazu führen, dass mehr Nutzer*innen auf die Daten zugreifen können. Überlege dir gut, ob du diese Änderung (z.B. wegen Datenschutzproblematiken) durchführen möchtest.",
				[
					{
						text: "Abbrechen",
						onPress: () => setNewValue(null),
						style: "cancel",
					},
					{
						text: "Ändern",
						onPress: () => {
							props.onChange(newValue);
							setNewValue(null);
						},
					},
				]
			);
		}
	}, [newValue]);

	return (
		<Select
			size="sm"
			label="Sichtbarkeit"
			placeholder="Sichtbarkeit auswählen..."
			options={getGroupPermissionOptions().map((role) => ({
				label: role.label,
				value: role.value.toString(),
			}))}
			value={props.value.toString()}
			onChange={(value) => {
				if (!value) return;
				if (
					props.initial === null ||
					props.initial === undefined ||
					props.initial === parseInt(value as string)
				) {
					props.onChange(parseInt(value as string));
				} else {
					setNewValue(parseInt(value as string));
				}
			}}
		/>
	);
};

export default UVCViewAccessSelect;
