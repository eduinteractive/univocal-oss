import { Box } from "@mantine/core";
import { COLORS } from "../../../constants/Colors";

const SectionDivider = () => {
	return (
		<Box
			className="uvc-section-divider"
			aria-hidden
			my={{ base: "md", sm: "lg" }}
		>
			<Box className="uvc-section-divider__line uvc-section-divider__line--start" />
			<Box
				className="uvc-section-divider__mark"
				style={{ backgroundColor: COLORS.PRIMARY }}
			/>
			<Box className="uvc-section-divider__line uvc-section-divider__line--end" />
		</Box>
	);
};

export default SectionDivider;
