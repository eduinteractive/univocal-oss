import { SurveyComponent, SurveyComponentNominalType, SurveyComponentType, SurveyExecutionMode, SurveyMeta, SurveyResult } from "../..";
import { APIHandler, createSVHMetadataAttrs, getSVHFilterParams, SVHFilterObject, updateSVHMetadataAttrs } from "../base";

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
