import { Document, Page, Text, StyleSheet, View } from '@react-pdf/renderer';
import { SVHEvent } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { Groups } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface EventCertificatePDFProps {
    event: SVHEvent;
    tenant: Groups;
}

const EventCertificatePDF = (props: EventCertificatePDFProps) => {
    const { t } = useTranslation();
    return (
        <Document>
            <Page size="A5" style={styles.page} orientation="landscape">
                <View style={styles.header}>
                    <Text style={styles.tenantTitle}>
                        {props.tenant.tenant?.title}
                    </Text>
                    <View style={styles.headerLine} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{t('EVENTS.CERTIFICATE.TITLE')}</Text>
                    <Text style={styles.description}>
                        {t('EVENTS.CERTIFICATE.DESCRIPTION', { title: props.event.title, date: dayjs(props.event.startDate).format('DD.MM.YYYY') })}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {t('EVENTS.CERTIFICATE.GENERATED_AT', { date: dayjs(new Date()).format('DD.MM.YYYY') })}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 24,
        height: '100%',
    },
    // Header Styling
    header: {
        width: '100%',
        marginBottom: 20,
    },
    tenantTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#333',
    },
    headerLine: {
        marginTop: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#1A73E8', // Eine auffällige Farbe für den Header
        width: '100%',
    },
    // Content Styling
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1A73E8', // Blau für den Titel der Bescheinigung
    },
    description: {
        fontSize: 14,
        lineHeight: 1.5,
        color: '#555', // Dezente Farbe für den Text
        marginHorizontal: 40,
        textAlign: 'center',
    },
    // Footer Styling
    footer: {
        marginTop: 20,
        alignItems: 'center',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 10,
        color: 'gray',
    },
});

export default EventCertificatePDF;
