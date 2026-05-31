import { Fragment, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { NotificationHandler } from "@/utils/NotificationHandler";
import UVCMetaForm, { UVCMetaFormSubmit } from "@/components/common/UVCMetaForm";
import { DateInput, Flex, Select, Text, TextInput, TextInputProps, TimeInput } from "@eduinteractive/balladui";
import UVCMaterialForm from "../../common/UVCMaterialForm";

interface CalendarItemFormSubmit {
	title: string;
	description?: string;
	viewAccess: number;
	location?: string;
	startDate: Date;
	endDate?: Date;
	color?: string;
	materials: {
		title: string;
		link: string;
		mimetype: string;
	}[];
	newUploads?: File[];
}

interface CalendarItemFormProps {
	data?: CalendarItemFormSubmit;
	onSubmit: (data: CalendarItemFormSubmit) => Promise<any>;
}

const CalendarItemForm = (props: CalendarItemFormProps) => {
	const [location, setLocation] = useState<string>("");
	const [startDate, setStartDate] = useState<Date>(
		props.data?.startDate ? new Date(props.data.startDate) : new Date()
	);
	const [endDate, setEndDate] = useState<Date>(
		props.data?.endDate ? new Date(props.data.endDate) : new Date()
	);
    const [startTime, setStartTime] = useState({
		hours: props.data?.startDate ? new Date(props.data.startDate).getHours() : new Date().getHours(),
		minutes: props.data?.startDate ? new Date(props.data.startDate).getMinutes() : new Date().getMinutes(),
	});

	const [endTime, setEndTime] = useState({
		hours: props.data?.endDate ? new Date(props.data.endDate).getHours() : new Date().getHours(),
		minutes: props.data?.endDate ? new Date(props.data.endDate).getMinutes() : new Date().getMinutes(),
	});
	const [color, setColor] = useState<string>("");
	const [materials, setMaterials] = useState<
		{
			title: string;
			link: string;
			mimetype: string;
		}[]
	>(props.data?.materials || []);
	const [newUploads, setNewUploads] = useState<File[]>([]);

	const locationRef = useRef<TextInputProps>(null);
	const colorRef = useRef<TextInputProps>(null);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (props.data) {
            const newStartDate = new Date(props.data.startDate);
			const newEndDate = props.data.endDate ? new Date(props.data.endDate) : new Date();
            setStartDate(newStartDate);
			setEndDate(newEndDate);
			
			setStartTime({
				hours: newStartDate.getHours(),
				minutes: newStartDate.getMinutes(),
			});
			
			setEndTime({
				hours: newEndDate.getHours(),
				minutes: newEndDate.getMinutes(),
			});
			setLocation(props.data.location || "");
			setColor(props.data.color || "");
			setMaterials(props.data.materials || []);
		} else {
			setLocation("");
			setStartDate(new Date());
			setEndDate(new Date());
			setColor("");
			setMaterials([]);
		}
	}, [props.data]);

	const handleSubmit = (data: UVCMetaFormSubmit) => {
		if (!startDate || !endDate) {
			return NotificationHandler.showError("Bitte fülle alle Pflichtfelder aus");
		}
		if (!startDate) {
			return NotificationHandler.showError("Bitte gebe ein Startdatum ein");
		}
		if (endDate && startDate > endDate) {
			return NotificationHandler.showError("Das Startdatum darf nicht nach dem Enddatum liegen");
		}

		setIsLoading(true);
		props.onSubmit({
			...data,
			location: location,
			startDate: startDate,
			endDate: endDate,
			color: color,
			materials: props.data?.materials || [],
			newUploads: newUploads,
		}).finally(() => setIsLoading(false));
	};

	const handleStartDateChange = (dateString: string) => {
		const newDate = new Date(dateString);
		// Keep the existing time components
		newDate.setHours(startTime.hours, startTime.minutes, 0, 0);
		setStartDate(newDate);
	};

	const handleEndDateChange = (dateString: string) => {
		const newDate = new Date(dateString);
		// Keep the existing time components
		newDate.setHours(endTime.hours, endTime.minutes, 0, 0);
		setEndDate(newDate);
	};

	const handleStartTimeChange = (time: string) => {
		// Handle empty or invalid time strings
		if (!time || !time.includes(":")) {
			return; // Don't update if time is invalid
		}
		
		const parts = time.split(":");
		const hours = Number(parts[0]) || 0;
		const minutes = Number(parts[1]) || 0;
		
		// Validate that hours and minutes are valid numbers
		if (isNaN(hours) || isNaN(minutes)) {
			return;
		}
		
		setStartTime({ hours, minutes });

		// Update the startDate with new time
		const newDate = new Date(startDate);
		newDate.setHours(hours, minutes, 0, 0);
		setStartDate(newDate);
	};

	const handleEndTimeChange = (time: string) => {
		// Handle empty or invalid time strings
		if (!time || !time.includes(":")) {
			return; // Don't update if time is invalid
		}
		
		const parts = time.split(":");
		const hours = Number(parts[0]) || 0;
		const minutes = Number(parts[1]) || 0;
		
		// Validate that hours and minutes are valid numbers
		if (isNaN(hours) || isNaN(minutes)) {
			return;
		}
		
		setEndTime({ hours, minutes });

		// Update the endDate with new time
		const newDate = new Date(endDate);
		newDate.setHours(hours, minutes, 0, 0);
		setEndDate(newDate);
	};

	// Format time for display
	const formatTime = (hours: number, minutes: number) => {
		// Ensure values are valid numbers, default to 0 if undefined or NaN
		const h = (typeof hours === 'number' && !isNaN(hours)) ? hours : 0;
		const m = (typeof minutes === 'number' && !isNaN(minutes)) ? minutes : 0;
		return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
	};

	const colorOptions = [
		{ label: "Blau", value: "#228be6" },
		{ label: "Rot", value: "#e64980" },
		{ label: "Lila", value: "#be4bdb" },
		{ label: "Violett", value: "#7950f2" },
		{ label: "Türkis", value: "#12b886" },
		{ label: "Grün", value: "#40c057" },
		{ label: "Gelb", value: "#fab005" },
		{ label: "Orange", value: "#fd7e14" },
	];

	return (
		<UVCMetaForm
			loading={isLoading}
			data={props.data || null}
			onSubmit={handleSubmit}
			after={
				<UVCMaterialForm
					materials={materials}
					setMaterials={setMaterials}
					newUploads={newUploads}
					setNewUploads={setNewUploads}
				/>
			}
			before={
				<Fragment>
					<Flex
						direction="row"
						gap="sm"
						flex={1}
						w="100%"
					>
						<DateInput
							size="sm"
							label="Startdatum"
							value={startDate}
							onChange={handleStartDateChange}
							minDate={new Date("2000-01-01")}
							maxDate={new Date("2099-12-31")}
						/>
						<TimeInput
							size="sm"
							label="Startzeit"
							value={formatTime(startTime.hours, startTime.minutes)}
							onChange={handleStartTimeChange}
						/>
					</Flex>
					<Flex
						direction="row"
						gap="sm"
					>
						<DateInput
							size="sm"
							label="Enddatum"
							value={endDate}
							onChange={handleEndDateChange}
							minDate={new Date("2000-01-01")}
							maxDate={new Date("2099-12-31")}
						/>
						<TimeInput
							size="sm"
							label="Endzeit"
							value={formatTime(endTime.hours, endTime.minutes)}
							onChange={handleEndTimeChange}
						/>
					</Flex>
				</Fragment>
			}
		>
			<TextInput
				size="sm"
				label="Ort"
				placeholder="Ort eingeben..."
				value={location}
				onChangeText={(text) => setLocation(text)}
				ref={locationRef as any}
				onSubmitEditing={() => (colorRef.current as any)?.focus()}
			/>

			<Select
				color={color ?? undefined}
				size="sm"
				label="Farbe"
				placeholder="Farbe auswählen..."
				options={colorOptions.map((option) => ({
					label: option.label,
					value: option.value,
				}))}
				value={color}
				onChange={(value) => setColor(value)}
				renderOption={(option) => <Text c={option.value}>{option.label}</Text>}
			/>
		</UVCMetaForm>
	);
};

export default CalendarItemForm;
