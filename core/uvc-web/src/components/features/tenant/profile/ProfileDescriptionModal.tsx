import { useEffect, useState } from 'react';
import SVHTextEditor from '../../../common/SVHTextEditor';
import { EDIModal } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

interface ProfileDescriptionModalProps {
    value: string;
    modalVisible: boolean;
    onClose: () => void;
    onSave: (description: string) => void;
}

const ProfileDescriptionModal = (props: ProfileDescriptionModalProps) => {
    const { t } = useTranslation();
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        setDescription(props.value);
    }, [props.value]);

    return (
        <EDIModal
            title={t('PROFILE.DESCRIPTION.MODAL_TITLE')}
            type="DEFAULT"
            visible={props.modalVisible}
            onClose={props.onClose}
            onSubmit={() => props.onSave(description)}
            size="xl"
            isForm
        >
            <SVHTextEditor
                text={description}
                onChange={(description) => setDescription(description)}
            />
        </EDIModal>
    );
};

export default ProfileDescriptionModal;
