import { SVHMetadata } from "../base";

export enum SurveyComponentNominalType {
    YESNO = "YESNO",
    CHECK = "CHECK",
    SEX = "SEX"
}

export enum SurveyComponentType {
    TEXT = "TEXT",
    LIKERT = "LIKERT",
    CHOICE = "CHOICE",
    OPEN = "OPEN",
    WORDCLOUD = "WORDCLOUD",
    NOMINAL = "NOMINAL",
}

export enum SurveyExecutionMode {
    TAN = "TAN",
    DEFAULT = "DEFAULT",
    PERSONAL = "PERSONAL",
    ANONYMOUS = "ANONYMOUS"
}

export interface SurveyMeta extends SVHMetadata {
    _id: string
    options: {
        executionMode: SurveyExecutionMode;
        tans?: {
            code: string;
            isUsed: boolean;
        }[];
        isActive: boolean;
        startDate?: Date | string | null;
        endDate?: Date | string | null;
        redirectionUrl?: string | null;
        resultsSharing?: boolean;
        showQuestionNumbers?: boolean;
    }
}

export interface SurveyComponent {
    _id: string;
    surveyId: string;
    title: string;
    required?: boolean;
    next?: string;
    previous?: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PublicSurveyResultsPayload {
    survey: {
        _id: string;
        title: string;
        description?: string;
    };
    components: SurveyComponent[];
    results: {
        _id: string;
        surveyId: string;
        answers: {
            [key: string]: unknown;
        };
        createdAt: Date;
        updatedAt: Date;
    }[];
}

export interface SurveyResult {
    _id: string;
    surveyId: string;
    personal: {
        type: SurveyExecutionMode;
        identifier?: string;
    },
    answers: {
        [key: string]: unknown;
    }
    createdAt: Date;
    updatedAt: Date;
}

export interface SurveyComponentText extends SurveyComponent {
    description?: string;
}

export interface SurveyComponentLikert extends SurveyComponent {
    scale: {
        labels: string[];
    }
}

export interface SurveyComponentChoice extends SurveyComponent {
    choices: string[];
    multiple: boolean;
    max?: number;
}

export interface SurveyComponentOpen extends SurveyComponent { }

export interface SurveyComponentWordcloud extends SurveyComponent { }

export interface SurveyComponentNominal extends SurveyComponent {
    nominalType: SurveyComponentNominalType;
}