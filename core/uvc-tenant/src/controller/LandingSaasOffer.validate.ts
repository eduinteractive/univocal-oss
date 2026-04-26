import { body } from "express-validator";

export const postSaasOfferChain = () => [
	body("name")
		.trim()
		.isLength({ min: 2, max: 200 })
		.withMessage("Bitte einen gültigen Namen angeben."),
	body("email")
		.trim()
		.isEmail()
		.withMessage("Bitte eine gültige E-Mail-Adresse angeben."),
	body("organization")
		.optional()
		.trim()
		.isLength({ min: 0, max: 300 })
		.withMessage("Hochschule/Organisation ist zu lang."),
	body("message").optional().isString().isLength({ max: 5000 }),
	body("website").optional().isString(),
];
