"use client";

import { Box, Title } from "@mantine/core";
import Link from "next/link";
import UVCHero from "../../../components/UVCHero";
import { LandingPageView } from "../../../components/LandingStats";
import { COLORS } from "../../../constants/Colors";
import classes from "./roadmap.module.css";

type Item = {
	title: string;
	points?: string[];
};

type Lane = {
	id: string;
	title: string;
	now?: boolean;
	later?: boolean;
	items: Item[];
};

const LANES: Lane[] = [
	{
		id: "jetzt",
		title: "Jetzt",
		now: true,
		items: [
			{
				title: "Version 1.1.1",
			},
		],
	},
	{
		id: "naechstes",
		title: "Als Nächstes",
		items: [
			{ title: "Netzwerk", points: ["Gremien", "Gruppen", "Kontakte"] },
			{
				title: "Veranstaltungen",
				points: ["Check-in mit QR-Code", "Live-Präsentation", "Abstimmungen"],
			},
			{ title: "Konditionale Umfragen", points: ["Folgefrage nach Antwort", "Mehrere Zweige"] },
		],
	},
	{
		id: "spaeter",
		title: "Später",
		later: true,
		items: [
			{
				title: "Weitere Vorhaben",
				points: ["Warteliste", "Projektvorlagen", "Benachrichtigungen", "Sitzungsprotokoll"],
			},
		],
	},
];

const Roadmap = () => {
	return (
		<>
			<LandingPageView path="/funktionen/roadmap" />
			<UVCHero
				title="Roadmap"
				content=""
				justify="center"
			/>
			<Box
				component="section"
				bg="white"
				py={{ base: "4rem", sm: "6.5rem" }}
				px={{ base: "md", sm: "xl" }}
			>
				<div className={classes.track}>
					<ol className={classes.board}>
						{LANES.map((lane) => (
							<li
								key={lane.id}
								className={
									lane.now
										? `${classes.lane} ${classes.laneNow}`
										: lane.later
											? `${classes.lane} ${classes.laneLater}`
											: classes.lane
								}
							>
								<span className={classes.marker} aria-hidden />
								<div className={classes.head}>
									<p className={classes.kicker}>{lane.title}</p>
								</div>
								<ul className={classes.items}>
									{lane.items.map((item) => (
										<li key={item.title}>
											<div className={classes.plate}>
													<Title
														order={3}
														size="h4"
														c={COLORS.PRIMARY}
														fw={800}
														style={{ letterSpacing: "-0.02em" }}
													>
														{item.title}
													</Title>
													{item.points && (
														<ul className={classes.points}>
															{item.points.map((point) => (
																<li key={point}>{point}</li>
															))}
														</ul>
													)}
													{lane.now && (
														<Link
															className={classes.changelog}
															href="/funktionen/changelog"
														>
															Im Changelog nachlesen
														</Link>
													)}
											</div>
										</li>
									))}
								</ul>
							</li>
						))}
					</ol>
				</div>
			</Box>
		</>
	);
};

export default Roadmap;
