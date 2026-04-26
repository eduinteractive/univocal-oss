import { EDIModal, EDISelect } from '@eduinteractive/mantine-common';
import { Budget } from '@eduinteractive/uvc-api';
import { SVHEvent } from '@eduinteractive/uvc-api';
import { SurveyMeta } from '@eduinteractive/uvc-api';
import { Wiki } from '@eduinteractive/uvc-api';
import { useState } from 'react';
import { ProjectConnector } from '@eduinteractive/uvc-api';
import { ProjectConnectorStrings } from '../../../../constants/Enums';
import { useTranslation } from 'react-i18next';

interface ProjectConnectorModalSubmitData {
    origin: ProjectConnector;
    target: string;
}

interface ProjectConnectorModalProps {
    data: {
        wikis: Wiki[];
        budgets: Budget[];
        events: SVHEvent[];
        surveys: SurveyMeta[];
    };
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectConnectorModalSubmitData) => void;
}

const ProjectConnectorModal = (props: ProjectConnectorModalProps) => {
    const { t } = useTranslation();
    const [origin, setOrigin] = useState<ProjectConnector | null>(null);
    const [target, setTarget] = useState<string | null>(null);
    const [wiki, setWiki] = useState<string | null>(null);

    const handleSubmit = () => {
        if (origin && target) {
            props.onSubmit({ origin, target })
        }
    }

    return (
        <EDIModal
            title={t('PROJECTS.CONNECTOR.TITLE')}
            type="DEFAULT"
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            mih={200}
            size="lg"
        >
            <EDISelect
                label={t('PROJECTS.CONNECTOR.SELECT_ORIGIN_LABEL')}
                placeholder={t('PROJECTS.CONNECTOR.SELECT_ORIGIN_PLACEHOLDER')}
                data={Object.keys(ProjectConnector).map((key) => ({
                    value: key,
                    label: ProjectConnectorStrings[
                        key as keyof typeof ProjectConnectorStrings
                    ],
                }))}
                value={origin}
                onChange={(value) => {
                    setOrigin(value as ProjectConnector);
                    if (value !== origin) {
                        setTarget(null);
                        setWiki(null);
                    }
                }}
            />
            {origin && (
                <EDISelect
                    label={`${ProjectConnectorStrings[origin as keyof typeof ProjectConnectorStrings]}${t('PROJECTS.CONNECTOR.SELECT_TARGET_LABEL_SUFFIX')}`}
                    placeholder={t('PROJECTS.CONNECTOR.SELECT_TARGET_PLACEHOLDER')}
                    data={
                        origin === ProjectConnector.BUDGET
                            ? props.data.budgets.map((budget) => ({
                                  value: budget._id,
                                  label: budget.title,
                              }))
                            : origin === ProjectConnector.WIKI
                              ? props.data.wikis.map((wiki) => ({
                                    value: wiki._id,
                                    label: wiki.title,
                                }))
                              : origin === ProjectConnector.EVENT
                                ? props.data.events.map((event) => ({
                                      value: event._id,
                                      label: event.title,
                                  }))
                                : props.data.surveys.map((survey) => ({
                                      value: survey._id,
                                      label: survey.title,
                                  }))
                    }
                    value={origin === ProjectConnector.WIKI ? wiki : target}
                    onChange={(value) => {
                        if (origin === ProjectConnector.WIKI) {
                            setWiki(value as string);
                            if (value !== wiki) {
                                setTarget(null);
                            }
                        } else {
                            setTarget(value as string);
                        }
                    }}
                />
            )}
            {origin === ProjectConnector.WIKI && wiki && <EDISelect 
                label={t('PROJECTS.CONNECTOR.SELECT_WIKI_CHAPTER_LABEL')}
                placeholder={t('PROJECTS.CONNECTOR.SELECT_WIKI_CHAPTER_PLACEHOLDER')}
                data={props.data.wikis.find((w) => w._id === wiki)?.tableOfContents.map((toc) => ({
                    value: wiki + ":" + toc.sectionId!,
                    label: toc.title,
                }))}
                value={target}
                onChange={(value) => setTarget(value as string)}
            />}
        </EDIModal>
    );
};

export default ProjectConnectorModal;
