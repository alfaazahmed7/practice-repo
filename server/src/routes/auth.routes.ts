import express from 'express';
import { getMe, refreshToken, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/register', registerUser);
router.get('/auth/get-me', getMe);
router.get('/auth/refresh-token', refreshToken);

export default router;