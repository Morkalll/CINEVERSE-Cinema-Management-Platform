import { verifyToken } from './token.services.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { describe, it, expect, vi } from 'vitest';

vi.mock('jsonwebtoken');

describe('verifyToken middleware', () => {
  it('should return 401 if no token is provided', () => {
    const req = { header: vi.fn().mockReturnValue('') };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No posee autorización requerida" });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', () => {
    const req = { header: vi.fn().mockReturnValue('Bearer validtoken') };
    const res = {};
    const next = vi.fn();
    
    jwt.verify.mockReturnValue({ id: 1, role: 'user' });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', JWT_SECRET);
    expect(req.user).toEqual({ id: 1, role: 'user' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    const req = { header: vi.fn().mockReturnValue('Bearer invalidtoken') };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    
    jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "No posee permisos correctos" });
    expect(next).not.toHaveBeenCalled();
  });
});
