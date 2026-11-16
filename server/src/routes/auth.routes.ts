import express from 'express';
import { getMe, logoutUser, refreshToken, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/register', registerUser);
router.get('/auth/get-me', getMe);
router.get('/auth/refresh-token', refreshToken);
router.get('/auth/logout', logoutUser);

export default router;