import { ProjectPlanning, ProjectPlanningProject } from "@/api/Project";
import { Box, Divider, Flex, Text } from "@eduinteractive/balladui";
import { PieChart } from "react-native-gifted-charts";
import { Pressable } from "react-native";

const DONE = "#0D9488";
const OVERDUE = "#E03131";
const DUE_SOON = "#F08C00";
const REMAINING = "#1C7ED6";

const remainingOpen = (project: Pick<ProjectPlanningProject, "open" | "overdue" | "dueSoon">) =>
	Math.max(project.open - project.overdue - project.dueSoon, 0);

const slicesFor = (counts: Pick<ProjectPlanningProject, "done" | "overdue" | "dueSoon" | "open">) =>
	[
		{ label: "Erledigt", value: counts.done, color: DONE },
		{ label: "Überfällig", value: counts.overdue, color: OVERDUE },
		{ label: "Bald fällig", value: counts.dueSoon, color: DUE_SOON },
		{ label: "Übrige offene", value: remainingOpen(counts), color: REMAINING },
	].filter((slice) => slice.value > 0);

interface ProjectPlanningSummaryProps {
	planning: ProjectPlanning;
	onOpen: (projectId: string) => void;
}

export default function ProjectPlanningSummary({ planning, onOpen }: ProjectPlanningSummaryProps) {
	const { totals } = planning;
	const projects = [...planning.projects].sort((a, b) => {
		if (b.overdue !== a.overdue) return b.overdue - a.overdue;
		if (b.dueSoon !== a.dueSoon) return b.dueSoon - a.dueSoon;
		return a.projectTitle.localeCompare(b.projectTitle, "de");
	});
	const slices = slicesFor(totals);
	const figures = [
		{ label: "Projekte", value: totals.projects, color: "#868E96" },
		{ label: "Offen", value: totals.open, color: REMAINING },
		{ label: "Überfällig", value: totals.overdue, color: OVERDUE },
		{ label: "Bald fällig", value: totals.dueSoon, color: DUE_SOON },
		{ label: "Ohne Zuweisung", value: totals.unassigned, color: "#868E96" },
	];

	return (
		<Flex
			direction="column"
			px="md"
			pt="md"
			pb="sm"
			style={{ backgroundColor: "white" }}
		>
			<Text
				fs="md"
				fw="bold"
				mb="md"
			>
				Planung
			</Text>
			<Flex
				direction="row"
				align="center"
				gap="md"
			>
				{totals.tasks === 0 ? (
					<Flex flex={1}>
						<Text
							fs="sm"
							c="gray.6"
						>
							Keine Aufgaben für die Übersicht.
						</Text>
					</Flex>
				) : (
					<PieChart
						donut
						radius={72}
						innerRadius={52}
						innerCircleColor="white"
						backgroundColor="white"
						strokeWidth={2}
						strokeColor="white"
						data={slices.map((slice) => ({
							value: slice.value,
							color: slice.color,
						}))}
						centerLabelComponent={() => (
							<Flex
								direction="column"
								align="center"
							>
								<Text
									fs="xl"
									fw="bold"
								>
									{totals.tasks}
								</Text>
								<Text
									fs="xs"
									c="gray.5"
								>
									Aufgaben
								</Text>
							</Flex>
						)}
					/>
				)}
				<Flex
					flex={1}
					direction="column"
					gap="sm"
				>
					{figures.map((figure) => (
						<Flex
							key={figure.label}
							direction="row"
							align="center"
							justify="space-between"
						>
							<Flex
								direction="row"
								align="center"
								gap="xs"
								flex={1}
							>
								<Box
									w={6}
									h={6}
									style={{ backgroundColor: figure.color, borderRadius: 3 }}
								/>
								<Text
									fs="xs"
									c="gray.6"
								>
									{figure.label}
								</Text>
							</Flex>
							<Text
								fs="sm"
								fw="bold"
							>
								{figure.value}
							</Text>
						</Flex>
					))}
				</Flex>
			</Flex>

			<Divider
				my="md"
				color="gray.2"
			/>

			{projects.map((project, index) => {
				const share = project.tasks === 0 ? 0 : Math.round((project.done / project.tasks) * 100);
				const segments = slicesFor(project);
				return (
					<Pressable
						key={project.projectId}
						onPress={() => onOpen(project.projectId)}
					>
						<Flex
							direction="column"
							py="sm"
							style={
								index < projects.length - 1
									? { borderBottomWidth: 1, borderBottomColor: "#F1F3F5" }
									: undefined
							}
						>
							<Flex
								direction="row"
								justify="space-between"
								align="center"
								mb={segments.length > 0 ? "xs" : undefined}
							>
								<Text
									fw="bold"
									fs="sm"
									style={{ flex: 1 }}
								>
									{project.projectTitle}
								</Text>
								<Text
									fs="sm"
									fw="bold"
									c={share === 100 ? "green.8" : "gray.6"}
								>
									{project.tasks === 0 ? "—" : `${share} %`}
								</Text>
							</Flex>
							{segments.length > 0 && (
								<Flex
									direction="row"
									h={6}
									w="100%"
									style={{ borderRadius: 3, overflow: "hidden", backgroundColor: "#F1F3F5" }}
								>
									{segments.map((segment) => (
										<Box
											key={segment.label}
											h={6}
											style={{ flex: segment.value, backgroundColor: segment.color }}
										/>
									))}
								</Flex>
							)}
						</Flex>
					</Pressable>
				);
			})}
		</Flex>
	);
}
