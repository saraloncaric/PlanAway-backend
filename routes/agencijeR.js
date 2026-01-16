import express from 'express';
import { dohvatiSveAgencije, dohvatiPoId, dohvatiPuovanjePoAgenciji, dohvatiUpitePoAgenciji } from '../controllers/agencijeC.js';

const router = express.Router();

router.get('/', dohvatiSveAgencije);
router.get('/:id', dohvatiPoId);
router.get('/:id/putovanja', dohvatiPuovanjePoAgenciji);
router.get('/:id/upiti', dohvatiUpitePoAgenciji);

export default router;