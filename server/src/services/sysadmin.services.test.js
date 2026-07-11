import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerSysAdmin } from './sysadmin.services.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

vi.mock('../models/User.js', () => ({
    User: {
        findOne: vi.fn(),
        create: vi.fn()
    }
}));

vi.mock('bcrypt', () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn()
    }
}));

describe('SysAdmin Services', () => {
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

    describe('registerSysAdmin', () => {
        it('should return 400 if missing fields', async () => {
            req.body = { email: 'sysadmin@test.com' }; // missing password
            await registerSysAdmin(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if user already exists', async () => {
            req.body = { email: 'sysadmin@test.com', password: '123' };
            User.findOne.mockResolvedValue({ id: 1 });

            await registerSysAdmin(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: "Usuario existente" });
        });

        it('should register sysadmin successfully', async () => {
            req.body = { username: 'sysadmin', email: 'sysadmin@test.com', password: '123' };
            User.findOne.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashed_password');
            User.create.mockResolvedValue({ id: 1, email: 'sysadmin@test.com', role: 'sysadmin' });

            await registerSysAdmin(req, res);

            expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
                role: 'sysadmin',
                password: 'hashed_password'
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1, email: 'sysadmin@test.com', role: 'sysadmin' });
        });
    });
});
