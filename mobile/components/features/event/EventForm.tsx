import { Fragment, useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import UVCMetaForm, { UVCMetaFormSubmit } from "@/components/common/UVCMetaForm";
import { DateInput, Flex, TimeInput } from "@eduinteractive/balladui";
import { UVCEvent } from "@/api/Events";
import { NotificationHandler } from "@/utils/NotificationHandler";

interface EventFormProps {
	data?: UVCEvent | null;
	loading: boolean;
	onSubmit: (data: {
		title: string;
		description?: string;
		viewAccess: number;
		startDate: Date;
		endDate: Date;
	}) => void;
}

export default function EventForm({ data, loading, onSubmit }: EventFormProps) {
	const [startDate, setStartDate] = useState<Date>(
		data?.startDate ? new Date(data.startDate) : new Date()
	);
	const [endDate, setEndDate] = useState<Date>(
		data?.endDate ? new Date(data.endDate) : new Date()
	);

	// Separate state for time components
	const [startTime, setStartTime] = useState({
		hours: data?.startDate ? new Date(data.startDate).getHours() : new Date().getHours(),
		minutes: data?.startDate ? new Date(data.startDate).getMinutes() : new Date().getMinutes(),
	});

	const [endTime, setEndTime] = useState({
		hours: data?.endDate ? new Date(data.endDate).getHours() : new Date().getHours(),
		minutes: data?.endDate ? new Date(data.endDate).getMinutes() : new Date().getMinutes(),
	});

	// Update dates and times when data changes (for edit mode)
	useEffect(() => {
		if (data) {
			const newStartDate = new Date(data.startDate);
			const newEndDate = data.endDate ? new Date(data.endDate) : new Date();
			
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
		}
	}, [data]);

	// Convert UVCEvent to UVCMetaFormSubmit format
	const formData: UVCMetaFormSubmit | null = data ? {
		title: data.title,
		description: data.description,
		viewAccess: data.viewAccess,
	} : null;

	// Create combined date-time objects for submission
	const getFinalStartDate = () => {
		const finalDate = new Date(startDate);
		finalDate.setHours(startTime.hours, startTime.minutes, 0, 0);
		return finalDate;
	};

	const getFinalEndDate = () => {
		const finalDate = new Date(endDate);
		finalDate.setHours(endTime.hours, endTime.minutes, 0, 0);
		return finalDate;
	};

	const handleSubmit = async (formData: UVCMetaFormSubmit) => {
		const finalStartDate = getFinalStartDate();
		const finalEndDate = getFinalEndDate();

		if (!finalStartDate || !finalEndDate || isNaN(finalStartDate.getTime()) || isNaN(finalEndDate.getTime())) {
			return NotificationHandler.showError("Du musst ein gültiges Start- und Enddatum auswählen!");
		}

		if (finalStartDate > finalEndDate) {
			return NotificationHandler.showError("Startdatum muss vor dem Enddatum liegen");
		}

		onSubmit({
			...formData,
			startDate: finalStartDate,
			endDate: finalEndDate,
		});
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
		const [hours, minutes] = time.split(":").map(Number);
		setStartTime({ hours, minutes });
		
		// Update the startDate with new time
		const newDate = new Date(startDate);
		newDate.setHours(hours, minutes, 0, 0);
		setStartDate(newDate);
	};

	const handleEndTimeChange = (time: string) => {
		const [hours, minutes] = time.split(":").map(Number);
		setEndTime({ hours, minutes });
		
		// Update the endDate with new time
		const newDate = new Date(endDate);
		newDate.setHours(hours, minutes, 0, 0);
		setEndDate(newDate);
	};

	// Format time for display
	const formatTime = (hours: number, minutes: number) => {
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<UVCMetaForm
				data={formData}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
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
			/>
		</KeyboardAvoidingView>
	);
} 