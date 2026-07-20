import { View } from "react-native";
import { Spinner } from "@eduinteractive/balladui";

const UVCLoader = () => {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
			<Spinner size="xl" />
		</View>
	);
};

export default UVCLoader;
