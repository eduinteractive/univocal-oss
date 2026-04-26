import { useEffect, useMemo, useState } from 'react';
import {
    SurveyComponent,
    SurveyComponentType,
    SurveyResult,
} from '@eduinteractive/uvc-api';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';

interface SurveyComponentWithResults extends SurveyComponent {
    results: unknown[];
}

interface SurveyResultsCSVProps {
    components: SurveyComponent[];
    results: SurveyResult[];
    children: React.ReactNode;
}

const SurveyResultsCSV = (props: SurveyResultsCSVProps) => {
    const { t } = useTranslation();
    const [csvData, setCsvData] = useState<{ [key: string]: unknown }[]>([]);

    useEffect(() => {
        if (props.components && props.results) {
            const startComponent = props.components.find((c) => !c.previous);

            // Falls keine Startkomponente gefunden wird, leere Liste zurückgeben
            if (!startComponent) {
                setCsvData([]);
            } else {
                // Erstellen der sortierten Liste
                const sortedComponents: SurveyComponentWithResults[] = [];
                let currentComponent: SurveyComponent | null = startComponent;

                while (currentComponent) {
                    // Find corresponding answers for the current component
                    if (currentComponent.type !== SurveyComponentType.TEXT) {
                        const componentAnswers = props.results.map(
                            (result: SurveyResult) =>
                                result.answers[currentComponent!._id]
                        );

                        // Add the component with mapped answers to the sortedComponents list
                        sortedComponents.push({
                            ...currentComponent,
                            results: componentAnswers,
                        });
                    }
                    const nextComponent = props.components.find(
                        (c) => c._id === currentComponent!.next
                    );
                    if (nextComponent) {
                        currentComponent = nextComponent;
                    } else {
                        currentComponent = null;
                    }
                }

                const csvArray = props.results.map((result) => {
                    const row: { [key: string]: unknown } = {};

                    sortedComponents.forEach((component) => {
                        row[component._id] =
                            result.answers[component._id] !== undefined ? result.answers[component._id] : '';
                    });

                    row['identifier'] = result.personal?.identifier;

                    return row;
                });

                setCsvData(csvArray);
            }
        }
    }, [props.components, props.results]);

    const headers = useMemo(
        () =>
            props.components
                .filter(
                    (component) => component.type !== SurveyComponentType.TEXT
                )
                .map((component) => ({
                    label: component.title || component._id,
                    key: component._id,
                })),
        [props.components]
    );

    return (
        <CSVLink
            data={csvData}
            headers={[{ label: '', key: 'identifier' }, ...headers]}
            filename={t('SURVEYS.PDF.RESULTS_FILENAME')}
            separator=';'
        >
            {props.children}
        </CSVLink>
    );
};

export default SurveyResultsCSV;
