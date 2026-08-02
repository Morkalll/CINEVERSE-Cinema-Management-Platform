import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, forgotPassword, resetPassword, changePassword } from './user.services.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as emailServices from './email.services.js';

vi.mock('../models/User.js', () => ({
    User: {
        findOne: vi.fn(),
        findByPk: vi.fn(),
    }
}));

vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn(),
        genSalt: vi.fn(),
        hash: vi.fn()
    }
}));

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn()
    }
}));

vi.mock('./email.services.js', () => ({
    sendLoginAlertEmail: vi.fn(),
    sendWelcomeEmail: vi.fn(),
    sendPasswordRecoveryEmail: vi.fn(),
    sendPasswordChangedEmail: vi.fn()
}));

describe('Auth Services', () => {
    
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { body: {}, params: {} };
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

    describe('forgotPassword', () => {
        it('should return 400 if email is missing', async () => {
            req.body = {};
            await forgotPassword(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should send password recovery email if user is found', async () => {
            req.body = { email: 'test@test.com' };
            User.findOne.mockResolvedValue({ id: 1, username: 'user1', email: 'test@test.com', password: 'hashedpassword123' });
            jwt.sign.mockReturnValue('valid_token');

            await forgotPassword(req, res);

            expect(emailServices.sendPasswordRecoveryEmail).toHaveBeenCalledWith('test@test.com', 'user1', 'valid_token');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('resetPassword', () => {
        it('should return 400 if newPassword is shorter than 8 characters', async () => {
            req.params = { token: 'valid_token' };
            req.body = { newPassword: 'short' };

            await resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "La nueva contraseña debe tener al menos 8 caracteres" });
        });

        it('should update password and send confirmation email', async () => {
            req.params = { token: 'valid_token' };
            req.body = { newPassword: 'newvalidpassword123' };

            jwt.verify.mockReturnValue({ id: 1, sig: 'assword123' });
            const mockSave = vi.fn();
            User.findByPk.mockResolvedValue({ id: 1, username: 'user1', email: 'test@test.com', password: 'hashedpassword123', save: mockSave });
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('new_hashed_password');

            await resetPassword(req, res);

            expect(mockSave).toHaveBeenCalled();
            expect(emailServices.sendPasswordChangedEmail).toHaveBeenCalledWith('test@test.com', 'user1');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('changePassword', () => {
        it('should return 400 if currentPassword or newPassword missing', async () => {
            req.user = { id: 1 };
            req.body = { newPassword: 'newvalidpassword123' };

            await changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if current password is wrong', async () => {
            req.user = { id: 1 };
            req.body = { currentPassword: 'wrong', newPassword: 'newvalidpassword123' };
            User.findByPk.mockResolvedValue({ id: 1, password: 'hashed' });
            bcrypt.compare.mockResolvedValue(false);

            await changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "La contraseña actual es incorrecta" });
        });

        it('should update password when valid', async () => {
            req.user = { id: 1 };
            req.body = { currentPassword: 'correct', newPassword: 'newvalidpassword123' };
            const mockSave = vi.fn();
            User.findByPk.mockResolvedValue({ id: 1, username: 'user1', email: 'test@test.com', password: 'hashed', save: mockSave });
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('new_hashed_password');

            await changePassword(req, res);

            expect(mockSave).toHaveBeenCalled();
            expect(emailServices.sendPasswordChangedEmail).toHaveBeenCalledWith('test@test.com', 'user1');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});

