import { body, check } from "express-validator"

export const loginChain = () => {
    return [
        body("mail").isString().isEmail().toLowerCase().withMessage("Das Passwort und der Benutzername stimmen nicht überein!"),
        body("password").isString().isLength({ min: 8 }).withMessage("Das Passwort und der Benutzername stimmen nicht überein!")
    ]
}

export const registerChain = () => {
    return [
        body("mail").isString().isEmail().toLowerCase().withMessage("Die E-Mail-Adresse ist ungültig!"),
        body("password").isString().isLength({ min: 8 }).withMessage("Das Passwort muss mindestens 8 Zeichen lang sein!"),
        body("contact").isObject().withMessage("Die Kontaktinformationen sind ungültig!"),
        body("contact.first_name").isString().withMessage("Der Vorname ist ungültig!"),
        body("contact.last_name").isString().withMessage("Der Nachname ist ungültig!"),
    ]
}

export const resetPasswordChain = () => {
    return [
        body("mail").isString().isEmail().toLowerCase().withMessage("Die E-Mail-Adresse ist ungültig!")
    ]
}

export const resetPasswordRepeatMailChain = () => {
    return [
        body("mail").isString().isEmail().toLowerCase().withMessage("Die E-Mail-Adresse ist ungültig!")
    ]
}

export const resetPasswordWithTokenChain = () => {
    return [
        check("token").isString().withMessage("Der Token ist ungültig!"),
        body("password").isString().isLength({ min: 8 }).withMessage("Das Passwort muss mindestens 8 Zeichen lang sein!")
    ]
}

export const verifyMailChain = () => {
    return [
        body("token").isString().withMessage("Der Token ist ungültig!")
    ]
}