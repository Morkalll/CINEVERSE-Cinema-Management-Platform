import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser } from './user.services.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as emailServices from './email.services.js';

vi.mock('../models/User.js', () => ({
    User: { findOne: vi.fn() }
}));

vi.mock('bcrypt', () => ({
    default: { compare: vi.fn() }
}));

vi.mock('jsonwebtoken', () => ({
    default: { sign: vi.fn() }
}));

vi.mock('./email.services.js', () => ({
    sendLoginAlertEmail: vi.fn(),
    sendWelcomeEmail: vi.fn()
}));

describe('Auth Services', () => {
    
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn()
        };
    });

    describe('loginUser', () => {
        it('should return 401 if user not found', async () => {
            req.body = { email: 'wrong@test.com', password: '123' };
            User.findOne.mockResolvedValue(null);

            await loginUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'wrong@test.com' } });
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ message: "Usuario no existente" });
        });

        it('should return 401 if password is wrong', async () => {
            req.body = { email: 'test@test.com', password: 'wrong' };
            User.findOne.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed' });
            bcrypt.compare.mockResolvedValue(false);

            await loginUser(req, res);

            expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ message: "Email y/o contraseña incorrecta" });
        });

        it('should return token on successful login', async () => {
            req.body = { email: 'test@test.com', password: 'correct' };
            User.findOne.mockResolvedValue({ id: 1, username: 'test', email: 'test@test.com', password: 'hashed', role: 'user' });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock_token_abc123');

            await loginUser(req, res);

            expect(jwt.sign).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                user: { id: 1, username: 'test', email: 'test@test.com', role: 'user' },
                token: 'mock_token_abc123'
            });
        });
    });
});
