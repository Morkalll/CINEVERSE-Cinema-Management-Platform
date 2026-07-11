import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAllScreens, findOneScreen, createScreen, deleteScreen } from './screen.services.js';
import { Screen } from '../models/Screen.js';
import { MovieShowing } from '../models/MovieShowing.js';
import { Seat } from '../models/Seats.js';
import { sequelize } from '../db.js';

vi.mock('../models/Screen.js', () => ({
    Screen: {
        findAll: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        findByPk: vi.fn()
    }
}));

vi.mock('../models/MovieShowing.js', () => ({
    MovieShowing: {
        findAll: vi.fn(),
        destroy: vi.fn()
    }
}));

vi.mock('../models/Seats.js', () => ({
    Seat: {
        destroy: vi.fn()
    }
}));

const mockTransaction = {
    commit: vi.fn(),
    rollback: vi.fn()
};

vi.mock('../db.js', () => ({
    sequelize: {
        transaction: vi.fn(() => mockTransaction)
    }
}));

describe('Screen Services', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { params: {}, body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    describe('findAllScreens', () => {
        it('should return all screens', async () => {
            const screens = [{ id: 1, capacity: 40 }];
            Screen.findAll.mockResolvedValue(screens);

            await findAllScreens(req, res);

            expect(Screen.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(screens);
        });

        it('should return 500 on error', async () => {
            Screen.findAll.mockRejectedValue(new Error('DB Error'));
            await findAllScreens(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('findOneScreen', () => {
        it('should return 404 if not found', async () => {
            req.params.id = 1;
            Screen.findOne.mockResolvedValue(null);

            await findOneScreen(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return screen if found', async () => {
            req.params.id = 1;
            const screen = { id: 1, capacity: 40 };
            Screen.findOne.mockResolvedValue(screen);

            await findOneScreen(req, res);
            expect(res.json).toHaveBeenCalledWith(screen);
        });
    });

    describe('createScreen', () => {
        it('should return 400 if capacity missing', async () => {
            await createScreen(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should create screen successfully', async () => {
            req.body = { capacity: 40 };
            Screen.create.mockResolvedValue({ id: 1, capacity: 40 });

            await createScreen(req, res);

            expect(Screen.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('deleteScreen', () => {
        it('should return 404 if not found and rollback', async () => {
            req.params.id = 1;
            Screen.findByPk.mockResolvedValue(null);

            await deleteScreen(req, res);
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should destroy screen, showings, seats, and commit', async () => {
            req.params.id = 1;
            const mockScreen = { id: 1, destroy: vi.fn() };
            Screen.findByPk.mockResolvedValue(mockScreen);
            MovieShowing.findAll.mockResolvedValue([{ id: 10 }]);

            await deleteScreen(req, res);

            expect(Seat.destroy).toHaveBeenCalledWith({ where: { showingId: 10 }, transaction: mockTransaction });
            expect(MovieShowing.destroy).toHaveBeenCalledWith({ where: { screenId: 1 }, transaction: mockTransaction });
            expect(mockScreen.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should rollback on error', async () => {
            req.params.id = 1;
            Screen.findByPk.mockRejectedValue(new Error('DB Error'));

            await deleteScreen(req, res);
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
