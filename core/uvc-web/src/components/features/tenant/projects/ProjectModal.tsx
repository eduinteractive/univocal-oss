import { Project } from "@eduinteractive/uvc-api";
import SVHMetaModal, { SVHMetaModalSubmitData } from "../../../common/SVHMetaModal";
import { useTranslation } from 'react-i18next';


interface ProjectModalSubmitProps extends SVHMetaModalSubmitData {
    viewAccess: number;
}

interface ProjectModalProps {
    values?: Project;
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: ProjectModalSubmitProps) => void;
}

const ProjectModal = (props: ProjectModalProps) => {
    const { t } = useTranslation();
    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        props.onSubmit({ ...data } as ProjectModalSubmitProps);
    };

    return (
        <SVHMetaModal
            config={{ viewAccess: true }}
            data={props.values || null}
            title={props.values ? t('PROJECTS.MODAL.EDIT') : t('PROJECTS.MODAL.CREATE')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
        />
    );
};

export default ProjectModal;
