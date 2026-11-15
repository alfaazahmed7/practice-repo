import { Request, Response } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface CustomJwtPayload {
    id: string;
}

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: 'User already exist!'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashPassword
        });

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'User register successfully',
            user: {
                name,
                email
            },
            accessToken
        });
    }
    catch (error) {
        console.error('Registration failed with:', error);

        return res.status(500).json({
            message: 'Server error happend'
        });
    }
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Token not found'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(token, secret) as CustomJwtPayload;
        if (!decoded.id) {
            return res.status(401).json({
                message: 'Invalid session'
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User fetched successfully',
            user: {
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('User fetched failed with:', error);

        return res.status(500).json({
            message: 'Server error happend'
        });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: 'Token not found!'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(refreshToken, secret) as CustomJwtPayload;
        if (!decoded.id) {
            return res.status(401).json({
                message: 'Invalid session'
            });
        }

        const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '15m' }
        );

        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 1000 // 7d
        });

        res.status(200).json({
            message: 'Access token refreshed successfully',
            accessToken
        });
    }
    catch (error) {
        console.error('Token refresh failed with:', error);

        res.status(500).json({
            message: 'Server error happend'
        });
    }
}