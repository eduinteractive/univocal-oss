import {
    Document,
    Page,
    StyleSheet,
    View,
    Text,
    Image,
} from '@react-pdf/renderer';
import { SurveyMeta } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface SurveyCodesPDFProps {
    survey: SurveyMeta;
    link: string;
    /** Pre-translated labels (avoids useTranslation inside PDF renderer) */
    labels?: {
        codeLabel: string;
        tanLabel: string;
        generatedAt: string;
        generatedIn: string;
    };
}

const SurveyCodesPDF = (props: SurveyCodesPDFProps) => {
    const labels = props.labels ?? {
        codeLabel: 'Code:',
        tanLabel: 'TAN:',
        generatedAt: 'Generiert am',
        generatedIn: 'in Univocal',
    };
    const [qrCodes, setQrCodes] = useState<
        { tan: string; qrCodeDataUri: string }[]
    >([]);

    useEffect(() => {
        const generateQRCodes = async () => {
            try {
                if (props.survey.options.tans) {
                    const unusedTans = props.survey.options.tans.filter(
                        (tan) => !tan.isUsed
                    );
                    const qrCodePromises = unusedTans.map(async (tan) => {
                        const dataUri = await QRCode.toDataURL(
                            `${props.link}?tan=${tan.code}`,
                            {
                                width: 40,
                            }
                        );
                        return { tan: tan.code, qrCodeDataUri: dataUri };
                    });

                    const qrCodesWithTans = await Promise.all(qrCodePromises);
                    setQrCodes(qrCodesWithTans);
                }
            } catch (err) {
                console.error(err);
            }
        };

        generateQRCodes();
    }, [props.link, props.survey]);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.table}>
                    <View style={styles.table}>
                        {/* Gehe durch die QR-Codes und TANs in Paaren (zwei pro Zeile) */}
                        {qrCodes.map((qrCode, index) => {
                            // Prüfen, ob das nächste Paar existiert
                            const nextQRCode = qrCodes[index + 1];
                            if (index % 2 !== 0) return null; // Nur jede zweite Iteration zeigt die Zeile an

                            return (
                                <View key={index} style={styles.tableRow}>
                                    {/* Erste Zelle in der Zeile */}
                                    <View style={styles.tableCell}>
                                        <Image
                                            style={styles.qrCode}
                                            src={qrCode.qrCodeDataUri}
                                        />
                                        <View style={styles.textContainer}>
                                            <Text style={styles.surveyTitle}>
                                                {props.survey.title}
                                            </Text>
                                            <Text style={styles.tanText}>
                                                {labels.codeLabel} {qrCode.tan}
                                            </Text>
                                            <Text style={styles.generatedText}>
                                                {labels.generatedAt}{' '}
                                                {new Date().toLocaleDateString()}{' '}
                                                {labels.generatedIn}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Zweite Zelle in der Zeile, falls vorhanden */}
                                    {nextQRCode && (
                                        <View style={styles.tableCell}>
                                            <Image
                                                style={styles.qrCode}
                                                src={nextQRCode.qrCodeDataUri}
                                            />
                                            <View style={styles.textContainer}>
                                                <Text
                                                    style={styles.surveyTitle}
                                                >
                                                    {props.survey.title}
                                                </Text>
                                                <Text style={styles.tanText}>
                                                    {labels.tanLabel} {nextQRCode.tan}
                                                </Text>
                                                <Text
                                                    style={styles.generatedText}
                                                >
                                                    {labels.generatedAt}{' '}
                                                    {new Date().toLocaleDateString()}{' '}
                                                    {labels.generatedIn}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 24,
        alignItems: 'center',
    },
    table: {
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
    },
    tableCell: {
        flex: 1,
        flexDirection: 'row', // Horizontal Layout für QR-Code und Text
        alignItems: 'center',
        padding: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf',
    },
    qrCode: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    textContainer: {
        flexDirection: 'column', // Vertikales Layout für Text
        justifyContent: 'center',
        width: '60%'
    },
    surveyTitle: {
        fontSize: 12,
        marginBottom: 5,
        width: '100%', // Maximale Breite zugewiesen, damit der Text umbricht
        textOverflow: 'ellipsis'
    },
    tanText: {
        fontSize: 10,
        marginBottom: 5,
    },
    generatedText: {
        fontSize: 8,
        color: '#555',
    },
});

export default SurveyCodesPDF;
