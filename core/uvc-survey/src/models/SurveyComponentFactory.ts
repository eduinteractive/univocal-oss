import { updateSurveyComponentRequest } from "../controller/SurveyComponent";
import { SurveyComponentAttrs, SurveyComponentChoice, SurveyComponentLikert, SurveyComponentNominal, SurveyComponentOpen, SurveyComponentText, SurveyComponentTextAttrs, SurveyComponentType, SurveyComponentWordcloud } from "./SurveyComponent";

export const createSurveyComponentFactory = (attrs: SurveyComponentAttrs) => {
    switch (attrs.type) {
        case SurveyComponentType.TEXT:
            return new SurveyComponentText({ ...attrs });
        case SurveyComponentType.LIKERT:
            return new SurveyComponentLikert({ ...attrs });
        case SurveyComponentType.CHOICE:
            return new SurveyComponentChoice({ ...attrs })
        case SurveyComponentType.OPEN:
            return new SurveyComponentOpen({ ...attrs })
        case SurveyComponentType.WORDCLOUD:
            return new SurveyComponentWordcloud({ ...attrs })
        case SurveyComponentType.NOMINAL:
            return new SurveyComponentNominal({ ...attrs })
    }
}

export const updateSurveyComponentFactory = async (componentId: string, attrs: updateSurveyComponentRequest) => {
    switch (attrs.type) {
        case SurveyComponentType.TEXT:
            return SurveyComponentText.findByIdAndUpdate(componentId, { ...attrs });
        case SurveyComponentType.LIKERT:
            return SurveyComponentLikert.findByIdAndUpdate(componentId, { ...attrs });
        case SurveyComponentType.CHOICE:
            return SurveyComponentChoice.findByIdAndUpdate(componentId, { ...attrs })
        case SurveyComponentType.OPEN:
            return SurveyComponentOpen.findByIdAndUpdate(componentId, { ...attrs })
        case SurveyComponentType.WORDCLOUD:
            return SurveyComponentWordcloud.findByIdAndUpdate(componentId, { ...attrs })
        case SurveyComponentType.NOMINAL:
            return SurveyComponentNominal.findByIdAndUpdate(componentId, { ...attrs })
    }
}