import { CalendarEvent } from "@/api/Calendar";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import { Text } from "@eduinteractive/balladui";

interface ItemProps {
	item: CalendarEvent;
	onClick: (event: CalendarEvent) => void;
}

const CalendarItem = (props: ItemProps) => {
	const { item } = props;

	return (
		<TouchableOpacity
			onPress={() => props.onClick(item)}
			style={{
				...styles.item,
				borderLeftColor: item.color || "blue",
				borderLeftWidth: 5,
                borderRadius: 4
			}}
		>
			<Text
				fs="xs"
				mt="xs"
				c="gray.4"
			>
				{dayjs(props.item.startDate).format("DD.MM.YYYY HH:mm")}
				{props.item.endDate && ` - ${dayjs(props.item.endDate).format("DD.MM.YYYY HH:mm")}`}
			</Text>
			<Text
				fs="smd"
				fw="bold"
				mt="xs"
			>
				{item.title}
			</Text>
		</TouchableOpacity>
	);
};

export default React.memo(CalendarItem);

const styles = StyleSheet.create({
	item: {
		marginVertical: 10,
		padding: 20,
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "lightgrey",
		flexDirection: "column",
		paddingBottom: 40,
	},
	itemButtonContainer: {
		flex: 1,
		alignItems: "flex-end",
	},
});
