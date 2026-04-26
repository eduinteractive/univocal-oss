import { View } from "react-native";
import { Spinner } from "@eduinteractive/balladui";

const SVHLoader = () => {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
			<Spinner size="xl" />
		</View>
	);
};

export default SVHLoader;
