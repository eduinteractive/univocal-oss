import { Request, Response, NextFunction } from "express"
import S3 from "aws-sdk/clients/s3"
import fs from "fs"
import { promisify } from "util";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";

const unlinkFile = promisify(fs.unlink);

let S3_SVH: S3

if (process.env.S3_ENDPOINT_URL && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
    S3_SVH = new S3({
        endpoint: process.env.S3_ENDPOINT_URL!,
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
        s3ForcePathStyle: true,
    })
}

export const uploadFile = async (key: string, file: Express.Multer.File, metadata?: string) => {
    try {
        if (!file) {
            throw new BadRequestError("Es wurde keine Datei hochgeladen.")
        }

        const filePath = file.path;
        const fileName = file.originalname.normalize("NFC").replace(/[^\w.\- ]+/g, '');

        const fileContent = fs.readFileSync(filePath);
        const parsedMetadata = JSON.parse(metadata || '{}');

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
            Body: fileContent,
        }

        const uploadResponse = await S3_SVH.upload(uploadParams).promise();
        await unlinkFile(file.path);

        return uploadResponse.Location
    } catch (err) {
        console.debug(err);
        throw new BadRequestError("Es ist ein Fehler beim Hochladen der Datei aufgetreten.")
    }
}

export const uploadFiles = async (keyPrefix: string, files: Express.Multer.File[], metadata?: string) => {
    if (!files || files.length === 0) {
        throw new BadRequestError("Es wurden keine Dateien zum Hochladen bereitgestellt.");
    }

    try {
        const uploads = files.map((file, index) => {
            const filePath = file.path;
            const fileName = Math.random().toString(36).substring(7) + "_" + file.originalname.normalize("NFC").replace(/[^\w.\- ]+/g, '');
            const fileContent = fs.readFileSync(filePath);
            const mimeType = file.mimetype; // MIME-Typ aus dem Multer-File-Objekt extrahieren

            // Optional: Parsen von Metadaten, falls vorhanden
            const parsedMetadata = metadata ? JSON.parse(metadata) : {};

            const uploadParams = {
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: `${keyPrefix}/${fileName}`,  // Eindeutiger Schlüssel für jede Datei
                Body: fileContent,
                Metadata: parsedMetadata,  // Hinzufügen von Metadaten, falls nötig
            };

            return S3_SVH.upload(uploadParams).promise()
                .then(uploadResponse => {
                    // Löschen der lokalen Datei nach dem Hochladen
                    return unlinkFile(filePath)
                        .then(() => {
                            return {
                                fileName: fileName.substring(
                                    fileName.indexOf('_') + 1, fileName.length
                                ), 
                                mimeType: mimeType, 
                                url: uploadResponse.Location
                            }; // Rückgabe von Dateinamen, MIME-Typ und URL
                        });
                });
        });

        // Promise.all wird alle Upload-Promises parallel verarbeiten
        return Promise.all(uploads);
    } catch (err) {
        console.error("Fehler beim Hochladen von Dateien: ", err);
        throw new BadRequestError("Es ist ein Fehler beim Hochladen der Dateien aufgetreten.");
    }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params as { key: string };
    const downloadParams = {
        Bucket: process.env.S3_BUCKET_NAME!, // Ersetzen Sie dies durch Ihren Bucket-Namen
        Key: decodeURIComponent(key.split(process.env.S3_BUCKET_NAME + '/')[1]), // Dateiname im Bucket
    };

    S3_SVH.headObject(downloadParams, (err, data) => {
        if (err) {
            return next(new NotFoundError("Es wurde keine Datei gefunden."))
        }

        res.setHeader('Content-Type', data.ContentType!);
        res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()?.substring(6)}"`);

        // Streamen der Datei zum Client
        const stream = S3_SVH.getObject(downloadParams).createReadStream();
        stream.on('error', (streamErr) => {
            return next(streamErr);
        });
        stream.pipe(res);
    });
}

export const streamImage = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params as { key: string };
    const downloadParams = {
        Bucket: process.env.S3_BUCKET_NAME!, // Ersetzen Sie dies durch Ihren Bucket-Namen
        Key: decodeURIComponent(key.split(process.env.S3_BUCKET_NAME + '/')[1]), // Dateiname im Bucket
    };

    S3_SVH.headObject(downloadParams, (err, data) => {
        try {
            if (err) {
                throw new NotFoundError("Es wurde keine Datei gefunden.");
            }

            res.setHeader('Content-Type', data.ContentType!);
            res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()?.substring(6)}"`);

            // Streamen der Datei zum Client
            const stream = S3_SVH.getObject(downloadParams).createReadStream();
            stream.pipe(res);
        } catch (err) {
            return next(err);
        }
    });
}

export const deleteFile = async (key: string) => {
    const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME!, // Ersetzen Sie dies durch Ihren Bucket-Namen
        Key: decodeURIComponent(key.split(process.env.S3_BUCKET_NAME + '/')[1]), // Dateiname im Bucket
    };

    try {
        await S3_SVH.deleteObject(deleteParams).promise();
        return true;
    } catch (err) {
        throw new BadRequestError("Es ist ein Fehler beim Löschen der Datei aufgetreten.")
    }
}