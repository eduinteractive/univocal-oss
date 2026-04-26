import ArrowDown from "./outline/arrow-down.svg";
import ArrowLeft from "./outline/arrow-left.svg";
import ArrowRight from "./outline/arrow-right.svg";
import ArrowUp from "./outline/arrow-up.svg";
import ArrowsLeftRight from "./outline/arrows-left-right.svg";
import Bucket from "./outline/bucket.svg";
import Calendar from "./outline/calendar.svg";
import Check from "./outline/check.svg";
import ChevronDown from "./outline/chevron-down.svg";
import ChevronUp from "./outline/chevron-up.svg";
import CircleCheck from "./outline/circle-check.svg";
import Circle from "./outline/circle.svg";
import Clipboard from "./outline/clipboard.svg";
import Compass from "./outline/compass.svg";
import Dashboard from "./outline/dashboard.svg";
import DotsVertical from "./outline/dots-vertical.svg";
import Download from "./outline/download.svg";
import ExternalLink from "./outline/external-link.svg";
import Edit from "./outline/edit.svg";
import EyeOff from "./outline/eye-off.svg";
import Eye from "./outline/eye.svg";
import FileCheck from "./outline/file-check.svg";
import File from "./outline/file.svg";
import Files from "./outline/files.svg";
import Home from "./outline/home.svg";
import Library from "./outline/library.svg";
import Link from "./outline/link.svg";
import List from "./outline/list.svg";
import Logout from "./outline/logout.svg";
import Mail from "./outline/mail.svg";
import Message from "./outline/message.svg";
import Messages from "./outline/messages.svg";
import Moneybag from "./outline/moneybag.svg";
import Network from "./outline/network.svg";
import Plus from "./outline/plus.svg";
import School from "./outline/school.svg";
import Search from "./outline/search.svg";
import Send from "./outline/send.svg";
import Settings from "./outline/settings.svg";
import TimelineEvent from "./outline/timeline-event.svg";
import Trash from "./outline/trash.svg";
import UserSquareRounded from "./outline/user-square-rounded.svg";
import User from "./outline/user.svg";
import UsersGroup from "./outline/users-group.svg";
import Users from "./outline/users.svg";
import X from "./outline/x.svg";

const IconMap = {
	"arrow-down": ArrowDown,
	"arrow-left": ArrowLeft,
	"arrow-right": ArrowRight,
	"arrow-up": ArrowUp,
	"arrows-left-right": ArrowsLeftRight,
	bucket: Bucket,
	calendar: Calendar,
	check: Check,
	"chevron-down": ChevronDown,
	"chevron-up": ChevronUp,
	circle: Circle,
	"circle-check": CircleCheck,
	clipboard: Clipboard,
	compass: Compass,
	dashboard: Dashboard,
	"dots-vertical": DotsVertical,
	download: Download,
	"external-link": ExternalLink,
	edit: Edit,
	eye: Eye,
	"eye-off": EyeOff,
	"file-check": FileCheck,
	files: Files,
	file: File,
	home: Home,
	library: Library,
	link: Link,
	list: List,
	logout: Logout,
	mail: Mail,
	message: Message,
	messages: Messages,
	moneybag: Moneybag,
	network: Network,
    plus: Plus,
	school: School,
	search: Search,
	send: Send,
	settings: Settings,
	"timeline-event": TimelineEvent,
	trash: Trash,
	user: User,
	"user-square-rounded": UserSquareRounded,
	"users-group": UsersGroup,
	users: Users,
	x: X,
};

interface TablerIconProps {
	icon: keyof typeof IconMap;
    size?: number;
    color?: string;
}

export const TablerIcon = (props: TablerIconProps) => {
	const { icon, size, color, ...rest } = props;

	const Icon = IconMap[props.icon];

	if (!Icon) {
		return null;
	}

	// Use provided color or default to black for better reliability in React Native
	// React Native SVG doesn't always handle "currentColor" reliably
	const strokeColor = color || "#000000";

	return (
		<Icon 
			{...rest} 
			width={size ?? 24} 
			height={size ?? 24}
			stroke={strokeColor}
		/>
	);
};

export const IconArrowDown = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="arrow-down"
		/>
	);
};

export const IconArrowLeft = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="arrow-left"
		/>
	);
};

export const IconArrowRight = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="arrow-right"
		/>
	);
};

export const IconArrowUp = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="arrow-up"
		/>
	);
};

export const IconArrowsLeftRight = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="arrows-left-right"
		/>
	);
};

export const IconBucket = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="bucket"
		/>
	);
};

export const IconCalendar = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="calendar"
		/>
	);
};

export const IconCheck = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="check"
		/>
	);
};

export const IconChevronDown = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="chevron-down"
		/>
	);
};

export const IconChevronUp = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="chevron-up"
		/>
	);
};

export const IconCircleCheck = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="circle-check"
		/>
	);
};

export const IconCircle = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="circle"
		/>
	);
};

export const IconClipboard = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="clipboard"
		/>
	);
};

export const IconCompass = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="compass"
		/>
	);
};

export const IconDashboard = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="dashboard"
		/>
	);
};

export const IconDotsVertical = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="dots-vertical"
		/>
	);
};

export const IconDownload = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="download"
		/>
	);
};

export const IconExternalLink = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="external-link"
		/>
	);
};

export const IconEdit = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="edit"
		/>
	);
};

export const IconEye = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="eye"
		/>
	);
};

export const IconEyeOff = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="eye-off"
		/>
	);
};

export const IconFileCheck = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="file-check"
		/>
	);
};

export const IconFiles = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="files"
		/>
	);
};

export const IconFile = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="file"
		/>
	);
};

export const IconHome = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="home"
		/>
	);
};

export const IconLibrary = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="library"
		/>
	);
};

export const IconLink = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="link"
		/>
	);
};

export const IconList = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="list"
		/>
	);
};

export const IconLogout = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="logout"
		/>
	);
};

export const IconMail = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="mail"
		/>
	);
};

export const IconMessage = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="message"
		/>
	);
};

export const IconMessages = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="messages"
		/>
	);
};

export const IconMoneybag = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="moneybag"
		/>
	);
};

export const IconNetwork = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="network"
		/>
	);
};

export const IconPlus = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="plus"
		/>
	);
};

export const IconSchool = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="school"
		/>
	);
};

export const IconSearch = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="search"
		/>
	);
};

export const IconSend = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="send"
		/>
	);
};

export const IconSettings = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="settings"
		/>
	);
};

export const IconTimelineEvent = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="timeline-event"
		/>
	);
};

export const IconTrash = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="trash"
		/>
	);
};

export const IconUser = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="user"
		/>
	);
};

export const IconUserSquareRounded = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="user-square-rounded"
		/>
	);
};

export const IconUsersGroup = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="users-group"
		/>
	);
};

export const IconUsers = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="users"
		/>
	);
};

export const IconX = (props: Partial<TablerIconProps>) => {
	return (
		<TablerIcon
			{...props}
			icon="x"
		/>
	);
};
