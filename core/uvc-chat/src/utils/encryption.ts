import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32; // 32 Bytes für AES-256
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000; // Anzahl der Iterationen für PBKDF2

/**
 * Generiert einen sicheren 32-Byte-Schlüssel aus einem Passwort/Key
 * Verwendet PBKDF2 mit SHA-256 für sichere Schlüsselableitung
 * @param password Der Passwort/Key-String
 * @param salt Optional: Ein Salt (wird zufällig generiert, wenn nicht angegeben)
 * @returns Ein Objekt mit { key: Buffer, salt: Buffer }
 */
function deriveKey(password: string, salt?: Buffer): { key: Buffer; salt: Buffer } {
    if (!password || password.length < 16) {
        throw new Error('Verschlüsselungsschlüssel muss mindestens 16 Zeichen lang sein');
    }

    const saltBuffer = salt || randomBytes(SALT_LENGTH);
    
    // Verwende PBKDF2 für sichere Schlüsselableitung
    const key = pbkdf2Sync(
        password,
        saltBuffer,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        'sha256'
    );

    return { key, salt: saltBuffer };
}

/**
 * Verschlüsselt einen Text mit AES-256-GCM
 * @param text Der zu verschlüsselnde Text
 * @param encryptionKey Der Verschlüsselungsschlüssel (mindestens 16 Zeichen)
 * @returns Verschlüsselter Text im Format: salt:iv:authTag:encryptedData (base64)
 */
export function encrypt(text: string, encryptionKey: string): string {
    if (!text) {
        return text;
    }

    if (!encryptionKey || encryptionKey.length < 16) {
        throw new Error('Verschlüsselungsschlüssel ist zu kurz oder fehlt. Mindestens 16 Zeichen erforderlich.');
    }

    // Generiere Salt und leite Schlüssel ab
    const { key, salt } = deriveKey(encryptionKey);
    
    // Generiere einen zufälligen IV für jede Nachricht
    const iv = randomBytes(IV_LENGTH);
    
    // Erstelle den Cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Verschlüssele den Text
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Hole den Auth Tag
    const authTag = cipher.getAuthTag();
    
    // Kombiniere Salt, IV, Auth Tag und verschlüsselten Text
    // Format: salt:iv:authTag:encryptedData (alle base64)
    return `${salt.toString('base64')}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Entschlüsselt einen Text mit AES-256-GCM
 * @param encryptedText Der verschlüsselte Text im Format: salt:iv:authTag:encryptedData (base64) oder altes Format: iv:authTag:encryptedData
 * @param encryptionKey Der Verschlüsselungsschlüssel (mindestens 16 Zeichen)
 * @returns Entschlüsselter Text oder der ursprüngliche Text, falls keine Verschlüsselung erkannt wird
 */
export function decrypt(encryptedText: string, encryptionKey: string): string {
    if (!encryptedText) {
        return encryptedText;
    }

    if (!encryptionKey || encryptionKey.length < 16) {
        console.warn('Verschlüsselungsschlüssel ist zu kurz oder fehlt. Kann Nachricht nicht entschlüsseln.');
        return encryptedText;
    }

    // Prüfe, ob der Text das Format einer verschlüsselten Nachricht hat
    const parts = encryptedText.split(':');
    
    // Neues Format: salt:iv:authTag:encryptedData (4 Teile)
    // Altes Format (Backward Compatibility): iv:authTag:encryptedData (3 Teile)
    if (parts.length !== 4 && parts.length !== 3) {
        // Keine Verschlüsselung erkannt - zurückgeben als unverschlüsselt (Backward Compatibility)
        return encryptedText;
    }

    try {
        let salt: Buffer | undefined;
        let ivBase64: string;
        let authTagBase64: string;
        let encrypted: string;

        if (parts.length === 4) {
            // Neues Format mit Salt
            [salt, ivBase64, authTagBase64, encrypted] = parts.map((part, index) => 
                index === 0 ? Buffer.from(part, 'base64') : part
            ) as [Buffer, string, string, string];
        } else {
            // Altes Format ohne Salt (Backward Compatibility)
            // Verwende einen festen Salt für alte Nachrichten (nicht ideal, aber für Migration nötig)
            salt = createHash('sha256').update(encryptionKey).digest().subarray(0, SALT_LENGTH);
            [ivBase64, authTagBase64, encrypted] = parts;
        }

        // Leite Schlüssel mit dem Salt ab
        const { key } = deriveKey(encryptionKey, salt);
        
        // Dekodiere IV und Auth Tag
        const iv = Buffer.from(ivBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');
        
        // Erstelle den Decipher
        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        // Entschlüssele den Text
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        // Bei Fehler (z.B. falscher Schlüssel, beschädigte Daten) - zurückgeben als unverschlüsselt (Backward Compatibility)
        console.warn('Fehler beim Entschlüsseln einer Nachricht:', error instanceof Error ? error.message : error);
        return encryptedText;
    }
}

/**
 * Prüft, ob ein Text verschlüsselt ist
 * @param text Der zu prüfende Text
 * @returns true, wenn der Text verschlüsselt ist
 */
export function isEncrypted(text: string): boolean {
    if (!text) {
        return false;
    }
    const parts = text.split(':');
    // Unterstützt sowohl neues Format (4 Teile) als auch altes Format (3 Teile)
    return parts.length === 4 || parts.length === 3;
}

