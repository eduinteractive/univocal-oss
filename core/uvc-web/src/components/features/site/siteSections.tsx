import { IconCalendarEvent, IconChartBar, IconHeartHandshake, IconNews } from '@tabler/icons-react';
import { PROFILE_SECTION_TYPE } from '@eduinteractive/uvc-api';
import { ReactNode } from 'react';

export const SECTION_ICONS: Record<PROFILE_SECTION_TYPE, ReactNode> = {
    [PROFILE_SECTION_TYPE.BOARD]: <IconNews size={16} />,
    [PROFILE_SECTION_TYPE.EVENTS]: <IconCalendarEvent size={16} />,
    [PROFILE_SECTION_TYPE.SURVEYS]: <IconChartBar size={16} />,
    [PROFILE_SECTION_TYPE.SUPPORT]: <IconHeartHandshake size={16} />,
};

/** Builder tab that manages the content of a section. */
export const SECTION_TAB: Record<PROFILE_SECTION_TYPE, string> = {
    [PROFILE_SECTION_TYPE.BOARD]: 'board',
    [PROFILE_SECTION_TYPE.EVENTS]: 'events',
    [PROFILE_SECTION_TYPE.SURVEYS]: 'surveys',
    [PROFILE_SECTION_TYPE.SUPPORT]: 'support',
};

export const sectionAnchor = (type: PROFILE_SECTION_TYPE) => `section-${type.toLowerCase()}`;
