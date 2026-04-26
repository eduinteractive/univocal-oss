/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    SurveyComponent,
    SurveyComponentType,
    SurveyResult as ISurveyResult,
} from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import SurveyResult from './SurveyResult';

export interface SurveyComponentWithResults extends SurveyComponent {
    results: any;
}

interface SurveyResultsProps {
    data: {
        components: SurveyComponent[];
        results: ISurveyResult[];
    }
}

const SurveyResults = (props: SurveyResultsProps) => {
    const [components, setComponents] = useState<SurveyComponentWithResults[]>(
        []
    );

    useEffect(() => {
        if (props.data) {
            const startComponent = props.data.components.find(
                (c) => !c.previous
            );

            // Falls keine Startkomponente gefunden wird, leere Liste zurückgeben
            if (!startComponent) {
                setComponents([]);
            } else {
                // Erstellen der sortierten Liste
                const sortedComponents: SurveyComponentWithResults[] = [];
                let currentComponent: SurveyComponent | null = startComponent;

                while (currentComponent) {
                    // Find corresponding answers for the current component
                    if (currentComponent.type !== SurveyComponentType.TEXT) {
                        const componentAnswers = props.data.results
                            .map(
                                (result: ISurveyResult) =>
                                    result.answers[currentComponent!._id]
                            ) // Map relevant answers by component ID
                            .filter(
                                (answer) =>
                                    answer !== undefined && answer !== null
                            );

                        // Add the component with mapped answers to the sortedComponents list
                        sortedComponents.push({
                            ...currentComponent,
                            results: componentAnswers,
                        });
                    }
                    const nextComponent =
                        props.data.components.find(
                            (c) => c._id === currentComponent!.next
                        );
                    if (nextComponent) {
                        currentComponent = nextComponent;
                    } else {
                        currentComponent = null;
                    }
                }
                setComponents(sortedComponents);
            }
        }
    }, [props.data]);

    return <>{components.map((component) => <SurveyResult data={component} />)}</>;
};

export default SurveyResults;
