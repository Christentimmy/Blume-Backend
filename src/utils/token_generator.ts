import jwt from 'jsonwebtoken';
import { IUser } from '../types/user_type';
import config from '../config/config';

const token_secret = config.jwt.secret;

if (!token_secret) {
    throw new Error("TOKEN_SECRET is missing in .env");
}

export function generateToken(user: IUser) {
    const token = jwt.sign({ id: user._id, role: user.role }, token_secret, {
        expiresIn: "2d",
    });
    return token;
}

export function validateToken(token: string) {
    const decoded = jwt.verify(token, token_secret);
    return decoded;
}


