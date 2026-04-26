import { Wiki } from '@eduinteractive/uvc-api';
import SVHMetaModal, {
    SVHMetaModalSubmitData,
} from '../../../../common/SVHMetaModal';
import { useTranslation } from 'react-i18next';

interface WikiModalSubmitProps extends SVHMetaModalSubmitData {
    viewAccess: number;
}

interface WikiModalProps {
    data?: Wiki;
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: WikiModalSubmitProps) => void;
}

const WikiModal = (props: WikiModalProps) => {
    const { t } = useTranslation();
    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        props.onSubmit({ ...data } as WikiModalSubmitProps);
    };

    return (
        <SVHMetaModal
            config={{ viewAccess: true }}
            data={props.data || null}
            title={props.data ? t('KNOWLEDGE.WIKI.EDIT') : t('KNOWLEDGE.WIKI.CREATE')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
        />
    );
};

export default WikiModal;
