import { Text, ThemeIcon } from '@mantine/core';
import {
    IconAlphabetLatin,
    IconChartArrows,
    IconClipboardCheck,
    IconCloudStar,
    IconDirections,
    IconFileUnknown,
    IconTypography,
} from '@tabler/icons-react';
import { SurveyComponentType } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface SurveyComponentIconProps {
    type: SurveyComponentType;
    withoutText?: boolean;
    color?: string;
}

export const SurveyComponentIcon = (props: SurveyComponentIconProps) => {
    const { t } = useTranslation();
    const renderIcon = () => {
        switch (props.type as SurveyComponentType) {
            case SurveyComponentType.TEXT:
                return <IconTypography />;
            case SurveyComponentType.LIKERT:
                return <IconChartArrows />;
            case SurveyComponentType.CHOICE:
                return <IconClipboardCheck />;
            case SurveyComponentType.OPEN:
                return <IconAlphabetLatin />;
            case SurveyComponentType.WORDCLOUD:
                return <IconCloudStar />;
            case SurveyComponentType.NOMINAL:
                return <IconDirections />;
            default:
                return <IconFileUnknown />;
        }
    };

    const renderText = () => {
        switch (props.type as SurveyComponentType) {
            case SurveyComponentType.TEXT:
                return t('SURVEYS.COMPONENT_TYPES.TEXT')
            case SurveyComponentType.LIKERT:
                return t('SURVEYS.COMPONENT_TYPES.LIKERT')
            case SurveyComponentType.CHOICE:
                return t('SURVEYS.COMPONENT_TYPES.CHOICE')
            case SurveyComponentType.OPEN:
                return t('SURVEYS.COMPONENT_TYPES.OPEN')
            case SurveyComponentType.WORDCLOUD:
                return t('SURVEYS.COMPONENT_TYPES.WORDCLOUD')
            case SurveyComponentType.NOMINAL:
                return t('SURVEYS.COMPONENT_TYPES.NOMINAL')
            default:
                return <IconFileUnknown />;
        }
    };

    return (
        <>
            <ThemeIcon
                color={props.color}
                variant="subtle"
                size={!props.withoutText ? 28 : 36}
                mb={!props.withoutText ? 'xs' : ''}
            >
                {renderIcon()}
            </ThemeIcon>
            {!props.withoutText && (
                <Text ta="center" size="xs" fw="bold">
                    {renderText()}
                </Text>
            )}
        </>
    );
};
