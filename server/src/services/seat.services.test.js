import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSeats, getOccupiedSeats, reserveSeats, releaseSeats } from './seat.services.js';
import { Seat } from '../models/Seats.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { sequelize } from '../db.js';

vi.mock('../models/Seats.js', () => ({
    Seat: {
        findAll: vi.fn(),
        update: vi.fn()
    }
}));

vi.mock('../models/Order.js', () => ({
    Order: {
        findByPk: vi.fn()
    }
}));

vi.mock('../models/OrderItem.js', () => ({
    OrderItem: {
        findAll: vi.fn()
    }
}));

const mockTransactionObject = {
    LOCK: { UPDATE: 'UPDATE' }
};

vi.mock('../db.js', () => ({
    sequelize: {
        transaction: vi.fn(async (callback) => {
            if (typeof callback === 'function') {
                return await callback(mockTransactionObject);
            }
            return { commit: vi.fn(), rollback: vi.fn() };
        })
    }
}));

describe('Seat Services', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { params: {}, body: {}, query: {}, user: { id: 1, role: 'user' } };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    describe('getSeats', () => {
        it('should return all seats for a showing', async () => {
            req.params.id = 1;
            const seats = [{ id: 1, label: '1-1' }];
            Seat.findAll.mockResolvedValue(seats);

            await getSeats(req, res);

            expect(Seat.findAll).toHaveBeenCalledWith({ where: { showingId: 1 } });
            expect(res.json).toHaveBeenCalledWith(seats);
        });

        it('should return 500 on error', async () => {
            req.params.id = 1;
            Seat.findAll.mockRejectedValue(new Error('DB Error'));

            await getSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getOccupiedSeats', () => {
        it('should return 400 if showingId is missing', async () => {
            await getOccupiedSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return occupied seats', async () => {
            req.query.showingId = 1;
            Seat.findAll.mockResolvedValue([{ label: '1-1' }, { label: '1-2' }]);

            await getOccupiedSeats(req, res);

            expect(Seat.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ occupiedSeats: ['1-1', '1-2'] });
        });
    });

    describe('reserveSeats', () => {
        it('should return 400 if missing fields', async () => {
            req.body = { userId: 1, showingId: 1 }; // missing seats
            await reserveSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if seats do not exist', async () => {
            req.body = { userId: 1, showingId: 1, seats: ['1-1', '1-2'] };
            Seat.findAll.mockResolvedValue([{ label: '1-1' }]); // only 1 seat found

            await reserveSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should return 409 if seats already reserved', async () => {
            req.body = { userId: 1, showingId: 1, seats: ['1-1'] };
            Seat.findAll.mockResolvedValue([{ label: '1-1', reserved: true }]);

            await reserveSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should reserve seats successfully', async () => {
            req.body = { userId: 1, showingId: 1, seats: ['1-1'] };
            Seat.findAll.mockResolvedValue([
                { id: 1, label: '1-1', status: 'Libre' }
            ]);Seat.update.mockResolvedValue([1]);

            await reserveSeats(req, res);

            expect(Seat.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: 'Asientos reservados exitosamente',
                reservedSeats: ['1-1']
            });
        });
    });

    describe('releaseSeats', () => {
        it('should return 400 if missing fields', async () => {
            req.body = { showingId: 1 };
            await releaseSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 401 if unauthenticated', async () => {
            req.user = undefined;
            req.body = { showingId: 1, seats: ['1-1'] };
            await releaseSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 404 if seats not found or not reserved', async () => {
            req.body = { showingId: 1, seats: ['1-1'] };
            Seat.findAll.mockResolvedValue([]);

            await releaseSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 if user does not own the seats and is not admin', async () => {
            req.body = { showingId: 1, seats: ['1-1'] };
            Seat.findAll.mockResolvedValue([{ label: '1-1', reserved: true }]);
            OrderItem.findAll.mockResolvedValue([{ seats: ['1-1'], orderId: 1 }]);
            Order.findByPk.mockResolvedValue({ userId: 2 }); // belongs to user 2, but requester is user 1

            await releaseSeats(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should release seats successfully for admin', async () => {
            req.user.role = 'admin';
            req.body = { showingId: 1, seats: ['1-1'] };
            Seat.findAll.mockResolvedValue([{ label: '1-1', reserved: true }]);
            Seat.update.mockResolvedValue([1]);

            await releaseSeats(req, res);
            expect(Seat.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: 'Asientos liberados exitosamente',
                releasedSeats: ['1-1']
            });
        });

        it('should release seats successfully if user owns them', async () => {
            req.body = { showingId: 1, seats: ['1-1'] };
            Seat.findAll.mockResolvedValue([{ label: '1-1', reserved: true }]);
            OrderItem.findAll.mockResolvedValue([{ seats: ['1-1'], orderId: 1 }]);
            Order.findByPk.mockResolvedValue({ userId: 1 }); // belongs to requester
            Seat.update.mockResolvedValue([1]);

            await releaseSeats(req, res);
            expect(Seat.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: 'Asientos liberados exitosamente',
                releasedSeats: ['1-1']
            });
        });
    });
});
