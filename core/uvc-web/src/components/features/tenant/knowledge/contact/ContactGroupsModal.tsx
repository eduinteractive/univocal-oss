import { ContactGroup } from "@eduinteractive/uvc-api";
import SVHMetaModal, { SVHMetaModalSubmitData } from "../../../../common/SVHMetaModal";
import { useTranslation } from 'react-i18next';

interface ContactGroupModalSubmitProps extends SVHMetaModalSubmitData {
    viewAccess: number;
}

interface ContactGroupModalProps {
    data?: ContactGroup;
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: ContactGroupModalSubmitProps) => void;
}

const ContactGroupModal = (props: ContactGroupModalProps) => {
    const { t } = useTranslation();
    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        props.onSubmit({ ...data } as ContactGroupModalSubmitProps);
    }

    return (
        <SVHMetaModal
            config={{ viewAccess: true }}
            data={props.data || null}
            title={props.data ? t('KNOWLEDGE.CONTACT_GROUP.EDIT') : t('KNOWLEDGE.CONTACT_GROUP.CREATE')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
        />
    )

}

export default ContactGroupModal;