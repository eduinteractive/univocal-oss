import { useState } from "react";
import { Image, Linking, Pressable, ScrollView, useWindowDimensions } from "react-native";
import Markdown from "react-native-markdown-display";
import dayjs from "dayjs";
import { Box, Flex, Text } from "@eduinteractive/balladui";
import { BASE_URL } from "@/api/APIHandler";
import {
	ProfileSectionType,
	PublicSite,
	PublicSiteBoardItem,
	PublicSiteEvent,
	PublicSitePage,
	PublicSiteSupportRequest,
	PublicSiteSurvey,
} from "@/api/Profile";
import { htmlToMarkdown } from "@/utils/Parser";

const PALETTE: Record<string, string> = {
	univocal: "#120875",
	"campus-navy": "#0f2a4a",
	forest: "#1f4d3a",
	rose: "#8a1f45",
	amber: "#87470a",
	slate: "#1f2937",
};

const SECTION_LABEL: Record<ProfileSectionType, string> = {
	BOARD: "Schwarzes Brett",
	EVENTS: "Events",
	SURVEYS: "Umfragen",
	SUPPORT: "Supportanfragen",
};

const profileImageUrl = (key?: string) =>
	key ? `${BASE_URL}/api/profile/image/${encodeURIComponent(key)}` : undefined;

const plain = (html?: string) => (html ? htmlToMarkdown(html, true).trim() : "");

const SectionTitle = ({ children, color }: { children: string; color: string }) => (
	<Text
		fs="lg"
		fw="bold"
		c={color}
	>
		{children}
	</Text>
);

const BoardItem = ({ item, color }: { item: PublicSiteBoardItem; color: string }) => {
	const [open, setOpen] = useState(false);
	const image = profileImageUrl(item.image);
	return (
		<Pressable onPress={() => setOpen((value) => !value)}>
			<Flex
				direction="column"
				gap="xs"
				p="md"
				bg="white"
				style={{ borderRadius: 12 }}
			>
				<Text
					fs="xs"
					fw="bold"
					c={color}
				>
					{item.kind === "NEWS" ? "Neuigkeit" : "Projekt"}
					{" · "}
					{dayjs(item.publishDate ?? item.updatedAt).format("DD.MM.YYYY")}
				</Text>
				<Text
					fs="md"
					fw="bold"
				>
					{item.title}
				</Text>
				{open ? (
					<Markdown>{htmlToMarkdown(item.content || "")}</Markdown>
				) : (
					<Text
						fs="sm"
						c="gray.4"
						numberOfLines={3}
					>
						{plain(item.content)}
					</Text>
				)}
				{open && image && (
					<Image
						source={{ uri: image }}
						style={{ width: "100%", height: 180, borderRadius: 8 }}
						resizeMode="cover"
					/>
				)}
			</Flex>
		</Pressable>
	);
};

const EventItem = ({ event }: { event: PublicSiteEvent }) => (
	<Flex
		direction="column"
		gap="xs"
		p="md"
		bg="white"
		style={{ borderRadius: 12 }}
	>
		<Text
			fs="sm"
			c="gray.4"
		>
			{dayjs(event.startDate).format("DD.MM.YYYY HH:mm")}
			{event.endDate ? ` – ${dayjs(event.endDate).format("DD.MM.YYYY HH:mm")}` : ""}
		</Text>
		<Text
			fs="md"
			fw="bold"
		>
			{event.title}
		</Text>
		{!!plain(event.description) && (
			<Text
				fs="sm"
				numberOfLines={4}
			>
				{plain(event.description)}
			</Text>
		)}
	</Flex>
);

const SurveyItem = ({ entry }: { entry: PublicSiteSurvey }) => (
	<Flex
		direction="column"
		gap="xs"
		p="md"
		bg="white"
		style={{ borderRadius: 12 }}
	>
		<Text
			fs="md"
			fw="bold"
		>
			{entry.survey.title}
		</Text>
		{!!plain(entry.survey.description) && (
			<Text
				fs="sm"
				numberOfLines={3}
			>
				{plain(entry.survey.description)}
			</Text>
		)}
		<Text
			fs="xs"
			c="gray.4"
		>
			{entry.responses} Antworten
		</Text>
	</Flex>
);

const SupportItem = ({ request }: { request: PublicSiteSupportRequest }) => (
	<Flex
		direction="column"
		gap="xs"
		p="md"
		bg="white"
		style={{ borderRadius: 12 }}
	>
		<Text
			fs="md"
			fw="bold"
		>
			{request.title}
		</Text>
		<Text
			fs="sm"
			numberOfLines={4}
		>
			{plain(request.description)}
		</Text>
	</Flex>
);

const PageItem = ({ page }: { page: PublicSitePage }) => {
	const [open, setOpen] = useState(false);
	return (
		<Pressable onPress={() => setOpen((value) => !value)}>
			<Flex
				direction="column"
				gap="xs"
				p="md"
				bg="white"
				style={{ borderRadius: 12 }}
			>
				<Text
					fs="md"
					fw="bold"
				>
					{page.title}
				</Text>
				{open && <Markdown>{htmlToMarkdown(page.content || "")}</Markdown>}
			</Flex>
		</Pressable>
	);
};

const SiteProfileViewer = ({ site, pages = [] }: { site: PublicSite; pages?: PublicSitePage[] }) => {
	const { width } = useWindowDimensions();
	const color = PALETTE[site.site.appearance?.palette ?? "univocal"] ?? PALETTE.univocal;
	const logo = profileImageUrl(site.site.logoImage || site.profile.avatarImage);
	const background = profileImageUrl(site.profile.backgroundImage);
	const description = site.profile.description || site.tenant.description;
	const gallery = site.site.galleryImages ?? [];
	const featured = site.featured ?? {
		board: [],
		events: [],
		surveys: [],
		supportRequests: [],
		pages: [],
	};
	const counts: Record<ProfileSectionType, number> = {
		BOARD: featured.board?.length ?? 0,
		EVENTS: featured.events?.length ?? 0,
		SURVEYS: featured.surveys?.length ?? 0,
		SUPPORT: featured.supportRequests?.length ?? 0,
	};
	const sections = (site.site.sections ?? []).filter(
		(section) => section.enabled && counts[section.type] > 0
	);
	const contacts = [
		site.profile.contactPerson,
		site.profile.contactEmail,
		site.profile.contactPhone,
		site.profile.contactWebsite,
	].filter(Boolean);

	const openContact = (value: string) => {
		if (value.includes("@")) Linking.openURL(`mailto:${value}`);
		else if (value.startsWith("http")) Linking.openURL(value);
		else if (/^[+\d][\d\s/-]+$/.test(value)) Linking.openURL(`tel:${value.replace(/\s/g, "")}`);
	};

	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: "#f6f7f9" }}
			contentContainerStyle={{ paddingBottom: 32 }}
		>
			<Box
				style={{
					minHeight: background ? 220 : 160,
					backgroundColor: color,
					justifyContent: "flex-end",
				}}
			>
				{background && (
					<Image
						source={{ uri: background }}
						style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
						resizeMode="cover"
					/>
				)}
				<Flex
					direction="column"
					gap="sm"
					p="md"
				>
					{logo ? (
						<Image
							source={{ uri: logo }}
							style={{
								width: 72,
								height: 72,
								borderRadius: 12,
								borderWidth: 3,
								borderColor: "white",
							}}
						/>
					) : (
						<Flex
							align="center"
							justify="center"
							style={{
								width: 72,
								height: 72,
								borderRadius: 12,
								backgroundColor: "white",
							}}
						>
							<Text
								fs="xl"
								fw="bold"
								c={color}
							>
								{site.tenant.title.slice(0, 2).toUpperCase()}
							</Text>
						</Flex>
					)}
					<Text
						fs="xl"
						fw="bold"
						style={{ color: "#ffffff" }}
					>
						{site.tenant.title}
					</Text>
					<Text
						fs="xs"
						style={{ color: "rgba(255,255,255,0.9)" }}
					>
						{site.site.published ? "Öffentlich" : "Nicht veröffentlicht"}
						{site.site.subdomain ? ` · ${site.site.subdomain}` : ""}
					</Text>
				</Flex>
			</Box>

			<Flex
				direction="column"
				gap="lg"
				p="md"
			>
				{!!description && (
					<Box
						bg="white"
						p="md"
						style={{ borderRadius: 12 }}
					>
						<Markdown>{htmlToMarkdown(description)}</Markdown>
					</Box>
				)}

				{gallery.length > 0 && (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
					>
						<Flex
							direction="row"
							gap="sm"
						>
							{gallery.map((image) => (
								<Image
									key={image}
									source={{ uri: profileImageUrl(image) }}
									style={{ width: width * 0.72, height: 180, borderRadius: 12 }}
									resizeMode="cover"
								/>
							))}
						</Flex>
					</ScrollView>
				)}

				{sections.map((section) => (
					<Flex
						key={section.type}
						direction="column"
						gap="sm"
					>
						<SectionTitle color={color}>{SECTION_LABEL[section.type]}</SectionTitle>
						{section.type === "BOARD" &&
							featured.board.map((item) => (
								<BoardItem
									key={item._id}
									item={item}
									color={color}
								/>
							))}
						{section.type === "EVENTS" &&
							featured.events.map((event) => (
								<EventItem
									key={event._id}
									event={event}
								/>
							))}
						{section.type === "SURVEYS" &&
							featured.surveys.map((entry) => (
								<SurveyItem
									key={entry.survey._id}
									entry={entry}
								/>
							))}
						{section.type === "SUPPORT" &&
							featured.supportRequests.map((request) => (
								<SupportItem
									key={request._id}
									request={request}
								/>
							))}
					</Flex>
				))}

				{(pages.length > 0 || (featured.pages?.length ?? 0) > 0) && (
					<Flex
						direction="column"
						gap="sm"
					>
						<SectionTitle color={color}>Infoseiten</SectionTitle>
						{(pages.length > 0 ? pages : featured.pages).map((page) => (
							<PageItem
								key={page._id}
								page={page}
							/>
						))}
					</Flex>
				)}

				{contacts.length > 0 && (
					<Flex
						direction="column"
						gap="sm"
					>
						<SectionTitle color={color}>Kontakt</SectionTitle>
						<Flex
							direction="column"
							gap="xs"
							p="md"
							bg="white"
							style={{ borderRadius: 12 }}
						>
							{contacts.map((value) => (
								<Pressable
									key={value}
									onPress={() => openContact(value!)}
								>
									<Text fs="sm">{value}</Text>
								</Pressable>
							))}
						</Flex>
					</Flex>
				)}

				{(site.site.socialLinks?.instagram || site.site.socialLinks?.other) && (
					<Flex
						direction="column"
						gap="xs"
					>
						<SectionTitle color={color}>Links</SectionTitle>
						{site.site.socialLinks.instagram && (
							<Pressable onPress={() => Linking.openURL(site.site.socialLinks!.instagram!)}>
								<Text
									fs="sm"
									c={color}
								>
									Instagram
								</Text>
							</Pressable>
						)}
						{site.site.socialLinks.other && (
							<Pressable onPress={() => Linking.openURL(site.site.socialLinks!.other!)}>
								<Text
									fs="sm"
									c={color}
								>
									{site.site.socialLinks.other}
								</Text>
							</Pressable>
						)}
					</Flex>
				)}
			</Flex>
		</ScrollView>
	);
};

export default SiteProfileViewer;
