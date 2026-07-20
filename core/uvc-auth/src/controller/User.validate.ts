import { body, check } from "express-validator"

export const changePasswordChain = () => {
    return [
        body("oldpassword").isString().withMessage("Das alte Passwort ist ungültig!"),
        body("newpassword").isString().isLength({ min: 8 }).withMessage("Das neue Passwort muss mindestens 8 Zeichen lang sein!")
    ]
}

export const getUserByIdChain = () => {
    return [
        check("userId").isMongoId().withMessage("Die Benutzer-ID ist ungültig!")
    ]
}


export const updateUserChain = () => {
    return [
        body("phone").isString().withMessage("Die Telefonnummer ist ungültig!")
    ]
}

export const updateUserPushTokenChain = () => {
    return [
        body("pushToken").isString().withMessage("Der Push Token ist ungültig!")
    ]
}

export const sendPushNotificationChain = () => {
    return [
        body("userId").optional().isMongoId().withMessage("Der Benutzer ID ist ungültig!"),
        body("userIds").optional().isArray().withMessage("Die Benutzer IDs sind ungültig!"),
        body("userIds.*").isMongoId().withMessage("Die Benutzer IDs sind ungültig!"),
        body("groupId").optional().isMongoId().withMessage("Die Gruppen ID ist ungültig!"),
        body("title").isString().withMessage("Der Titel ist ungültig!"),
        body("message").isString().withMessage("Die Nachricht ist ungültig!")
    ]
}

export const isMailExistingChain = () => {
    return [
        body("mail").isString().isEmail().toLowerCase().withMessage("Die E-Mail-Adresse ist ungültig!")
    ]
}

export const banUserChain = () => {
    return [
        check("userId").isMongoId().withMessage("Die Benutzer-ID ist ungültig!")
    ]
}

export const requestAccountDeletionChain = () => [
	body("email")
		.trim()
		.isEmail()
		.withMessage("Bitte eine gültige E-Mail-Adresse angeben."),
	body("website").optional().isString(),
];