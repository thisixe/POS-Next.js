import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'admin.Bamrungwong';

export interface JWTPayload {
    userId: string;
}

export const getUser = async (token?: string) => {
    if (!token) return null;

    try {
        // Remove 'Bearer ' prefix if present
        const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

        const decoded = jwt.verify(tokenValue, JWT_SECRET) as JWTPayload;
        const user = await User.findById(decoded.userId);

        return user;
    } catch (error) {
        return null;
    }
};
