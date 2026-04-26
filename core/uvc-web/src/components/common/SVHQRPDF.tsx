import {
    Document,
    Page,
    Text,
    StyleSheet,
    Image,
    View,
} from '@react-pdf/renderer';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import dayjs from 'dayjs';

interface SVHQRPDFProps {
    title: string;
    link: string;
    generationNotice?: string;
}

const SVHQRPDF = (props: SVHQRPDFProps) => {
    const [qrCodeDataUri, setQrCodeDataUri] = useState<string | null>(null);

    useEffect(() => {
        const generateQRCode = async () => {
            try {
                if (props.link) {
                    const dataUri = await QRCode.toDataURL(props.link, {
                        width: 200,
                    });
                    setQrCodeDataUri(dataUri);
                }
            } catch (err) {
                console.error(err);
            }
        };

        generateQRCode();
    }, [props.link]);

    const footerText = `${props.generationNotice ?? 'Generiert auf Univocal am'} ${dayjs(new Date()).format('DD.MM.YYYY')}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Hauptinhalt wird vertikal und horizontal zentriert */}
                <View style={styles.content}>
                    <Text style={styles.title}>{props.title}</Text>
                    {qrCodeDataUri && (
                        <Image style={styles.qrCode} src={qrCodeDataUri} />
                    )}
                </View>
                {/* Fußzeile unten zentriert */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>{footerText}</Text>
                </View>
            </Page>
        </Document>
    );
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        justifyContent: 'space-between', // Verteilt den Platz zwischen content und footer
        alignItems: 'center',
        padding: 24,
        height: '100%',
    },
    content: {
        flex: 1, // Nimmt den verfügbaren Platz ein
        justifyContent: 'center', // Zentriert den Inhalt vertikal
        alignItems: 'center', // Zentriert den Inhalt horizontal
        marginBottom: '100px',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center', // Text zentriert
    },
    qrCode: {
        width: 400,
        height: 400,
    },
    footer: {
        marginBottom: 20, // Abstand vom unteren Rand der Seite
        alignItems: 'center', // Zentriert den Text horizontal
    },
    footerText: {
        fontSize: 10,
        color: 'gray',
        textAlign: 'center', // Text zentriert
    },
});

// eslint-disable-next-line react-refresh/only-export-components
export default SVHQRPDF;
