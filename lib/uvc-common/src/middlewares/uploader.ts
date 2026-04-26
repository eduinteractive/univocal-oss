import multer from "multer";

const getExtension = (filename: string) => {
    return filename.substring(filename.lastIndexOf('.'), filename.length);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + getExtension(file.originalname));
    },
})

export const uploader = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });
