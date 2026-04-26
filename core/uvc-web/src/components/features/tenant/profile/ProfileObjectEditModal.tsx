import { useEffect, useState } from 'react';
import { EDIModal, EDISelect, EDITextInput, NotificationHandler } from '@eduinteractive/mantine-common';
import SVHTextEditor from '../../../common/SVHTextEditor';
import SVHCropDropzone from '../../../common/SVHCropDropzone';
import { PROFILE_OBJECT_STATUS } from '../../../../constants/Enums';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { useTranslation } from 'react-i18next';

interface ProfileObjectEditModalSubmitProps {
    title: string;
    content: string;
    image?: File | string;
    status?: PROFILE_OBJECT_STATUS;
}

interface ProfileObjectEditModalProps {
    modalVisible: boolean;
    prefix: string;
    values?: ProfileObjectEditModalSubmitProps;
    onClose: () => void;
    onSubmit: (data: ProfileObjectEditModalSubmitProps) => void;
}

const ProfileObjectEditModal = (props: ProfileObjectEditModalProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [image, setImage] = useState<File | string | undefined>(undefined);
    const [status, setStatus] = useState<PROFILE_OBJECT_STATUS | undefined>(undefined);

    const handleSubmit = () => {
        if (!title) {
            return NotificationHandler.showError(t('PROFILE.OBJECTS.ERROR_TITLE_REQUIRED'));
        }
        if (!content) {
            return NotificationHandler.showError(t('PROFILE.OBJECTS.ERROR_CONTENT_REQUIRED'));
        }
        props.onSubmit({ title, content, image: image as File, status });
    };

    useEffect(() => {
        if (props.values) {
            setTitle(props.values.title);
            setContent(props.values.content);
            setImage(props.values.image ? props.values.image : undefined);
            setStatus(props.values.status);
        } else {
            setTitle('');
            setContent('');
            setImage(undefined);
            setStatus(undefined);
        }
    }, [props.values]);

    return (
        <EDIModal
            title={`${props.prefix} erstellen`}
            type="DEFAULT"
            visible={props.modalVisible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            size="lg"
            isForm
        >
            <EDITextInput
                label={t('COMMON.ATTRIBUTES.TITLE')}
                placeholder={t('COMMON.ATTRIBUTES.TITLE_PLACEHOLDER')}
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                required
            />

            <SVHTextEditor
                text={content}
                onChange={(text) => setContent(text)}
            />

            {checkPermission(currentTenant!, 'profile_objects:publish') && (
                <EDISelect
                    label={t('PROFILE.OBJECTS.STATUS.TITLE')}
                    placeholder={t('PROFILE.OBJECTS.STATUS.PLACEHOLDER')}
                    value={status}
                    onChange={(value) => setStatus(value as PROFILE_OBJECT_STATUS)}
                    data={[
                        { value: PROFILE_OBJECT_STATUS.DRAFT, label: t('PROFILE.OBJECTS.STATUS.DRAFT') },
                        { value: PROFILE_OBJECT_STATUS.PUBLISHED, label: t('PROFILE.OBJECTS.STATUS.PUBLISHED') },
                    ]}
                />
            )}

            <SVHCropDropzone
                aspectRatio={16 / 9}
                value={image}
                onSelected={setImage}
                onRemove={() => setImage(undefined)}
            />
        </EDIModal>
    );
};

export default ProfileObjectEditModal;
