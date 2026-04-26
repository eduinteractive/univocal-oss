import { ProjectConnector, SurveyComponentNominalType, SurveyComponentType, SurveyExecutionMode } from "@eduinteractive/uvc-api";

export enum AUTH_FORM_STATE {
    LOGIN,
    REGISTER,
    RESET,
    RESETWITHTOKEN
}

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>?/|\\`~]).{8,}$/;

export enum GROUP_PERMISSION_LEVEL {
    GUEST = 0,
    MEMBER = 1,
    MODERATOR = 2,
    ADMIN = 3,
}

export const GROUP_PERMISSION_LEVELS = [
    { value: GROUP_PERMISSION_LEVEL.GUEST, label: 'Gast' },
    { value: GROUP_PERMISSION_LEVEL.MEMBER, label: 'Mitglied' },
    { value: GROUP_PERMISSION_LEVEL.MODERATOR, label: 'Moderator*in' },
    { value: GROUP_PERMISSION_LEVEL.ADMIN, label: 'Administrator*in' },
];

export enum PROFILE_OBJECT_STATUS {
    DRAFT = "DRAFT",
    EXAMINATION = "EXAMINATION",
    PUBLISHED = "PUBLISHED"
}

export const PROFILE_OBJECT_STATUS_STRINGS = {
    [PROFILE_OBJECT_STATUS.DRAFT]: 'Entwurf',
    [PROFILE_OBJECT_STATUS.EXAMINATION]: 'Prüfung',
    [PROFILE_OBJECT_STATUS.PUBLISHED]: 'Veröffentlicht'
}

export const SURVEY_EXECUTION_MODE_STRINGS = {
    [SurveyExecutionMode.DEFAULT]: 'Standard - Anonym ohne Einschränkungen',
    [SurveyExecutionMode.ANONYMOUS]: 'Anonym - Nur eine Antwort pro Gerät',
    [SurveyExecutionMode.PERSONAL]: 'Personalisiert',
    [SurveyExecutionMode.TAN]: 'Umfragecodes'
};

export const SurveyComponentNominalTypeStings = {
    [SurveyComponentNominalType.CHECK]: "Check",
    [SurveyComponentNominalType.YESNO]: "Ja/Nein",
    [SurveyComponentNominalType.SEX]: "Geschlecht"
}

export const SurveyComponentTypeStrings = {
    [SurveyComponentType.TEXT]: 'Text',
    [SurveyComponentType.LIKERT]: 'Skala: Likert',
    [SurveyComponentType.CHOICE]: 'Multiple/Single Choice',
    [SurveyComponentType.OPEN]: 'Offene Frage',
    [SurveyComponentType.WORDCLOUD]: 'Wortwolke',
    [SurveyComponentType.NOMINAL]: 'Skala: Nominal'
};

export const SurveyComponentNominalScale = {
    [SurveyComponentNominalType.CHECK]: ['Ja', 'Nein'],
    [SurveyComponentNominalType.YESNO]: ['Ja', 'Nein'],
    [SurveyComponentNominalType.SEX]: ['Männlich', 'Weiblich', 'Divers', 'Keine Angabe']
}

export const ProjectConnectorStrings = {
    [ProjectConnector.BUDGET]: 'Budget',
    [ProjectConnector.WIKI]: 'Wiki-Kapitel',
    [ProjectConnector.EVENT]: 'Event',
    [ProjectConnector.SURVEY]: 'Umfrage'
}