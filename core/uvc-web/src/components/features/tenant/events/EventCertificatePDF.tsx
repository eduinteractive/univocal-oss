import { Document, Page, Text, StyleSheet, View } from '@react-pdf/renderer';
import { SVHEvent } from '@eduinteractive/uvc-api';
import { Groups } from '@eduinteractive/uvc-api';

interface EventCertificatePDFProps {
    event: SVHEvent;
    tenant: Groups;
    /** Pre-translated labels (avoids useTranslation inside PDF renderer) */
    labels: {
        title: string;
        description: string;
        generatedAt: string;
    };
}

const EventCertificatePDF = (props: EventCertificatePDFProps) => (
    <Document>
        <Page size="A5" style={styles.page} orientation="landscape">
            <View style={styles.header}>
                <Text style={styles.tenantTitle}>{props.tenant.tenant?.title}</Text>
                <View style={styles.headerLine} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{props.labels.title}</Text>
                <Text style={styles.description}>{props.labels.description}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{props.labels.generatedAt}</Text>
            </View>
        </Page>
    </Document>
);

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 24,
        height: '100%',
    },
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
        borderBottomColor: '#1A73E8',
        width: '100%',
    },
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
        color: '#1A73E8',
    },
    description: {
        fontSize: 14,
        lineHeight: 1.5,
        color: '#555',
        marginHorizontal: 40,
        textAlign: 'center',
    },
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
