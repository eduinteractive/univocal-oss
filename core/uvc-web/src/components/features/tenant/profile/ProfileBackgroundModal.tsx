import { useEffect, useState } from 'react';
import SVHCropDropzone from '../../../common/SVHCropDropzone';
import { EDIModal } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

export interface ProfileBackgroundModalSubmit {
    backgroundImage?: File | string | null;
}

interface ProfileBackgroundModalProps {
    modalVisible: boolean;
    values?: ProfileBackgroundModalSubmit;
    onClose: () => void;
    onSubmit: (data: ProfileBackgroundModalSubmit) => void;
}

const ProfileBackgroundModal = (props: ProfileBackgroundModalProps) => {
    const { t } = useTranslation();
    const [backgroundImage, setBackgroundImage] = useState<
        File | string | null
    >(null);

    useEffect(() => {
        if (props.values) {
            setBackgroundImage(props.values.backgroundImage || '');
        } else {
            setBackgroundImage(null);
        }
    }, [props.values]);

    return (
        <EDIModal
            title={t('PROFILE.BACKGROUND.TITLE')}
            type="DEFAULT"
            visible={props.modalVisible}
            onClose={props.onClose}
            onSubmit={() => {
                props.onSubmit({
                    backgroundImage
                });
                props.onClose();
            }}
            size="lg"
            isForm
        >
            <SVHCropDropzone
                aspectRatio={16 / 9}
                value={backgroundImage}
                onSelected={setBackgroundImage}
                onRemove={() => setBackgroundImage(null)}
            />
        </EDIModal>
    );
};

export default ProfileBackgroundModal;
