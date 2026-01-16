import { body, param, query, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.message });
    }
    next();
}
export const validationRegistracija = (req, res, next) => {
    body('ime')
        .trim()
        .notEmpty().withMessage('Ime je obavezno')
        .isLength({ min: 2 }).withMessage('Ime mora imati minimalno 2 znaka')
        .escape(),
    body('prezime')
        .trim()
        .notEmpty().withMessage('Prezime je obavezno')
        .isLength({ min: 2 }).withMessage('Prezime mora imati minimalno 2 znaka')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email je obavezno')
        .isEmail().withMessage('Email adresa nije ispravna')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Lozinka je obavezna')
        .isLength({ min: 6 }).withMessage('Lozinka mora imati minimalno 6 znakova'),
    handleValidationErrors
}
export const validationLogin = (req, res, next) => {
    body('email')
        .trim()
        .notEmpty().withMessage('Email je obavezan')
        .isEmail().withMessage('Email adresa nije ispravna')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Lozinka je obavezna'),
    handleValidationErrors
}
export const validationToDo = (req, res, next) => {
    body('kategorija')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Kategorija može imati maksimalno 50 znakova')
        .escape(),
    handleValidationErrors
}
export const validationId = (req, res, next) => {
    param('id').isInt({ min: 1}).withMessage('ID mora biti pozitivan broj'),
    handleValidationErrors
}