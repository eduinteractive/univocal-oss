import APIHandler, { createSVHMetadataAttrs, getSVHFilterParams, SVHFilterObject, SVHMetadata, updateSVHMetadataAttrs } from "./APIHandler";

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

interface getSurveysRequest {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getSurveys = async (req: getSurveysRequest): Promise<SurveyMeta[]> => {
    const response = await APIHandler.get(`/survey/tenant/${req.tenantId}/survey`, { params: getSVHFilterParams(req.params) });
    return response.data;
}

interface getSurveyRequest {
    tenantId: string;
    surveyId: string;
}

export const getSurvey = async (req: getSurveyRequest): Promise<{
    survey: SurveyMeta,
    components: SurveyComponent[],
    results: SurveyResult[];
}> => {
    const response = await APIHandler.get(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}`);
    return response.data;
}

interface getPublicSurveyRequest {
    surveyId: string;
    fingerprint: string;
}

export const getPublicSurvey = async (req: getPublicSurveyRequest): Promise<{
    survey: SurveyMeta,
    components: SurveyComponent[]
}> => {
    if (!req.fingerprint) throw new Error("Fingerprint is required for public surveys");
    const response = await APIHandler.get(`/survey/public/survey/${req.surveyId}`, {params: {identifier: req.fingerprint}});
    return response.data;
}

interface createSurveyRequest {
    tenantId: string;
    body: createSVHMetadataAttrs & {
        options: {
            executionMode: SurveyExecutionMode;
        }
    }
}

export const createSurvey = async (req: createSurveyRequest): Promise<SurveyMeta> => {
    const response = await APIHandler.post(`/survey/tenant/${req.tenantId}/survey`, req.body);
    return response.data;
}

interface updateSurveyRequest {
    tenantId: string;
    surveyId: string;
    body: updateSVHMetadataAttrs & {
        options?: {
            executionMode?: SurveyExecutionMode;
            isActive?: boolean;
        }
    }
}

export const updateSurvey = async (req: updateSurveyRequest): Promise<SurveyMeta> => {
    const response = await APIHandler.put(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}`, req.body);
    return response.data;
}

interface deleteSurveyRequest {
    tenantId: string;
    surveyId: string;
}

export const deleteSurvey = async (req: deleteSurveyRequest): Promise<void> => {
    await APIHandler.delete(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}`);
}

interface generateSurveyCodesRequest {
    tenantId: string;
    surveyId: string;
    body: {
        amount: number;
    }
}

export const generateSurveyCodes = async (req: generateSurveyCodesRequest): Promise<void> => {
    await APIHandler.put(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/gencodes`, req.body);
}

interface resetSurveyCodesRequest {
    tenantId: string;
    surveyId: string;
}

export const resetSurveyCodes = async (req: resetSurveyCodesRequest): Promise<void> => {
    await APIHandler.put(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/rescodes`);
}

interface createSurveyComponentRequest {
    tenantId: string;
    surveyId: string;
    body: {
        title: string;
        type: SurveyComponentType;
        previous?: string;
        // Component Specific
        description?: string;
        scale?: {
            labels: string[];
        }
        choices?: string[];
        multiple?: boolean;
        max?: number;
        nominalType?: SurveyComponentNominalType;
    };
}

export const createSurveyComponent = async (req: createSurveyComponentRequest): Promise<SurveyComponent> => {
    const response = await APIHandler.post(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/component`, req.body);
    return response.data;
}

interface updateSurveyComponentRequest {
    tenantId: string;
    surveyId: string;
    componentId: string;
    body: {
        type: SurveyComponentType;
        title?: string;
        required?: boolean;
        description?: string;
        scale?: {
            labels: string[];
        }
        choices?: string[];
        multiple?: boolean;
        max?: number;
        nominalType?: SurveyComponentNominalType;
    }
}

export const updateSurveyComponent = async (req: updateSurveyComponentRequest): Promise<SurveyComponent> => {
    const response = await APIHandler.put(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/component/${req.componentId}`, req.body);
    return response.data;
}

interface updateSurveyComponentOrderRequest {
    tenantId: string;
    surveyId: string;
    componentId: string;
    body: {
        order: -1 | 1;
    }
}

export const updateSurveyComponentOrder = async (req: updateSurveyComponentOrderRequest): Promise<SurveyComponent> => {
    const response = await APIHandler.put(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/component/${req.componentId}/order`, req.body);
    return response.data;
}

interface deleteSurveyComponentRequest {
    tenantId: string;
    surveyId: string;
    componentId: string;
}

export const deleteSurveyComponent = async (req: deleteSurveyComponentRequest): Promise<void> => {
    await APIHandler.delete(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/component/${req.componentId}`);
}

interface getSurveyResultRequest {
    tenantId: string;
    surveyId: string;
}

export const getSurveyResult = async (req: getSurveyResultRequest): Promise<{
    survey: SurveyMeta,
    components: SurveyComponent[],
    results: SurveyResult[]
}> => {
    const response = await APIHandler.get(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/result`);
    return response.data;
}

interface deleteSurveyResultRequest {
    tenantId: string;
    surveyId: string;
    resultId: string;
}

export const deleteSurveyResult = async (req: deleteSurveyResultRequest): Promise<SurveyResult> => {
    const response = await APIHandler.delete(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/result/${req.resultId}`);
    return response.data;
}

interface deleteSurveyResultsRequest {
    tenantId: string;
    surveyId: string;
}

export const deleteSurveyResults = async (req: deleteSurveyResultsRequest): Promise<void> => {
    await APIHandler.delete(`/survey/tenant/${req.tenantId}/survey/${req.surveyId}/result`);
}

interface createSurveyResultRequest {
    surveyId: string;
    body: {
        personal: {
            identifier?: string;
        },
        answers: {
            [key: string]: unknown;
        }
    }
}

export const createSurveyResult = async (req: createSurveyResultRequest): Promise<SurveyResult> => {
    const response = await APIHandler.post(`/survey/public/survey/${req.surveyId}/result`, req.body);
    return response.data;
}