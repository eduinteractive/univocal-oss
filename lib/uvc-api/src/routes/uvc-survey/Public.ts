import { PublicSurveyResultsPayload, SurveyComponent, SurveyMeta, SurveyResult } from "../..";
import { APIHandler } from "../base";

interface getPublicSurveyRequest {
    surveyId: string;
}

export const getPublicSurvey = async (req: getPublicSurveyRequest): Promise<{
    survey: SurveyMeta,
    components: SurveyComponent[]
}> => {
    const response = await APIHandler.get(`/survey/public/survey/${req.surveyId}`);
    return response.data;
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

export const getPublicSurveyResults = async (req: getPublicSurveyRequest): Promise<PublicSurveyResultsPayload> => {
    const response = await APIHandler.get(`/survey/public/survey/${req.surveyId}/result`);
    return response.data;
}

export const createSurveyResult = async (req: createSurveyResultRequest): Promise<SurveyResult> => {
    const response = await APIHandler.post(`/survey/public/survey/${req.surveyId}/result`, req.body);
    return response.data;
}