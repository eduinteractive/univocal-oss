import { EDIModal } from '@eduinteractive/mantine-common';
import { News } from '@eduinteractive/uvc-api';
import { TenantProject } from '@eduinteractive/uvc-api';
import { Image, Text, Title } from '@mantine/core';
import classes from './ProfileObjectModal.module.css';
import SVHPageWrapper from '../../../common/SVHPageWrapper';
import { PROFILE_OBJECT_STATUS_STRINGS } from '../../../../constants/Enums';
import DOMPurify from 'dompurify';
import LOGO from '../../../../assets/logo.png';

interface ProfileObjectModalProps {
    data: News | TenantProject | null;
    title: string;
    visible: boolean;
    onClose: () => void;
}

const ProfileObjectModal = (props: ProfileObjectModalProps) => {
    if (!props.data) {
        return null;
    }

    return (
        <EDIModal
            visible={props.visible}
            type="ALERT"
            title={props.title}
            onClose={props.onClose}
            classNames={{
                body: classes.modal,
            }}
        >
            <Image
                src={
                    props.data.image
                        ? `${
                              import.meta.env.VITE_KUBERNETES_HOST
                          }/api/profile/image/${encodeURIComponent(
                              props.data.image
                          )}`
                        : LOGO
                }
                alt="News"
                width="100%"
                height={200}
                fit="cover"
                style={{
                    backgroundColor: props.data.image ? undefined : 'white',
                    objectFit: props.data.image ? undefined : 'contain',
                    overflow: props.data.image ? undefined : 'hidden',
                }}
            />
            <SVHPageWrapper p="md">
                <Text size="xs" c="dimmed">
                    {PROFILE_OBJECT_STATUS_STRINGS[props.data.status]}
                </Text>
                <Title order={6}>{props.data.title}</Title>
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(props.data.content),
                    }}
                />
            </SVHPageWrapper>
        </EDIModal>
    );
};

export default ProfileObjectModal;
