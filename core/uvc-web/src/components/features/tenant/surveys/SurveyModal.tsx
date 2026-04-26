import { useEffect, useState } from 'react';
import { EDISelect, NotificationHandler } from '@eduinteractive/mantine-common';
import { SurveyExecutionMode, SurveyMeta } from '@eduinteractive/uvc-api';
import { SURVEY_EXECUTION_MODE_STRINGS } from '../../../../constants/Enums';
import SVHMetaModal, {
    SVHMetaModalSubmitData,
} from '../../../common/SVHMetaModal';
import { useTranslation } from 'react-i18next';

interface SurveyModalSubmitProps extends SVHMetaModalSubmitData {
    viewAccess: number;
    options: {
        executionMode: SurveyExecutionMode;
    };
}

interface SurveyModalProps {
    data?: SurveyMeta;
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: SurveyModalSubmitProps) => void;
}

const SurveyModal = (props: SurveyModalProps) => {
    const { t } = useTranslation();
    const [executionMode, setExecutionMode] = useState(
        props.data?.options.executionMode || SurveyExecutionMode.DEFAULT
    );

    useEffect(() => {
        if (props.data) {
            setExecutionMode(
                props.data.options.executionMode ===
                    SurveyExecutionMode.PERSONAL
                    ? SurveyExecutionMode.DEFAULT
                    : props.data.options.executionMode
            );
        } else {
            setExecutionMode(SurveyExecutionMode.DEFAULT);
        }
    }, [props.data]);

    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        if (!executionMode) {
            NotificationHandler.showError(
                t('SURVEYS.ERRORS.EXECUTION_MODE_REQUIRED')
            );
            return;
        }
        props.onSubmit({
            ...data,
            options: { executionMode },
        } as SurveyModalSubmitProps);
    };

    return (
        <SVHMetaModal
            config={{ viewAccess: true }}
            data={props.data || null}
            title={props.data ? t('SURVEYS.MODAL.EDIT') : t('SURVEYS.MODAL.CREATE')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
        >
            <EDISelect
                label={t('SURVEYS.FIELDS.EXECUTION_MODE')}
                placeholder={t('SURVEYS.FIELDS.EXECUTION_MODE_PLACEHOLDER')}
                value={executionMode}
                onChange={(value) =>
                    setExecutionMode(value as SurveyExecutionMode)
                }
                required
                data={Object.keys(SURVEY_EXECUTION_MODE_STRINGS)
                    .filter((key) => key !== SurveyExecutionMode.PERSONAL)
                    .map((key) => ({
                        value: key,
                        label: SURVEY_EXECUTION_MODE_STRINGS[
                            key as SurveyExecutionMode
                        ],
                    }))}
            />
        </SVHMetaModal>
    );
};

export default SurveyModal;
