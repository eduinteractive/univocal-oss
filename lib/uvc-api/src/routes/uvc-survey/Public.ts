import { SurveyComponent, SurveyMeta, SurveyResult } from "../..";
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

export const createSurveyResult = async (req: createSurveyResultRequest): Promise<SurveyResult> => {
    const response = await APIHandler.post(`/survey/public/survey/${req.surveyId}/result`, req.body);
    return response.data;
}