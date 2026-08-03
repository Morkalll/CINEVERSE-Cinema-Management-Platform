import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPreference, handleWebhook, refundPayment } from './payment.services.js';
import Order from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Products } from '../models/Products.js';
import { Seat } from '../models/Seats.js';
import { MovieShowing } from '../models/MovieShowing.js';
import { User } from '../models/User.js';

// Mocks
const mockTransaction = { LOCK: { UPDATE: 'UPDATE' } };

vi.mock('../db.js', () => ({
    sequelize: {
        define: vi.fn(),
        transaction: vi.fn(async (cb) => {
            if (typeof cb === 'function') return await cb(mockTransaction);
            return mockTransaction;
        })
    }
}));

vi.mock('../models/Order.js', () => {
    return { default: { findByPk: vi.fn(), update: vi.fn() } };
});

vi.mock('../models/OrderItem.js', () => {
    return { OrderItem: { findByPk: vi.fn(), findAll: vi.fn() } };
});

vi.mock('../models/Products.js', () => {
    return { Products: { findByPk: vi.fn() } };
});

vi.mock('../models/Seats.js', () => {
    return { Seat: { update: vi.fn() } };
});

vi.mock('../models/MovieShowing.js', () => {
    return { MovieShowing: { findByPk: vi.fn() } };
});

vi.mock('../models/User.js', () => {
    return { User: { findByPk: vi.fn() } };
});

vi.mock('./email.services.js', () => ({
    sendRefundEmail: vi.fn(),
    sendPaymentSuccessEmail: vi.fn()
}));

const mockPaymentGet = vi.fn();

vi.mock('mercadopago', () => {
    return {
        MercadoPagoConfig: class {},
        Preference: class {
            create = vi.fn().mockResolvedValue({ id: 'pref_123', init_point: 'url1', sandbox_init_point: 'url2' })
        },
        Payment: class {
            get = (...args) => mockPaymentGet(...args);
        }
    };
});

describe('Payment Services', () => {
    
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ results: [], status: 'approved' })
        });
        mockPaymentGet.mockResolvedValue({ id: 'pay_456', external_reference: '1', status: 'approved' });
        req = {
            user: { id: 1, role: 'client' },
            params: {},
            body: {}
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            sendStatus: vi.fn()
        };
    });

    describe('createPreference', () => {
        it('should return 400 if orderId is missing', async () => {
            await createPreference(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should successfully create preference and return initPoint', async () => {
            req.body = { orderId: 1 };
            
            const mockOrder = { 
                id: 1, 
                userId: 1, 
                status: 'pending', 
                orderItems: [{ name: 'Popcorn', price: '5.0', quantity: 2 }],
                update: vi.fn()
            };
            Order.findByPk.mockResolvedValue(mockOrder);

            await createPreference(req, res);

            expect(Order.findByPk).toHaveBeenCalled();
            expect(mockOrder.update).toHaveBeenCalledWith({ mpPreferenceId: 'pref_123' });
            expect(res.json).toHaveBeenCalledWith({
                preferenceId: 'pref_123',
                initPoint: 'url1',
                sandboxInitPoint: 'url2'
            });
        });
    });

    describe('handleWebhook', () => {
        it('should update order status to paid on approved payment', async () => {
            req.body = { type: 'payment', data: { id: 'pay_456' } };

            const mockOrder = { id: 1, orderItems: [], update: vi.fn() };
            Order.findByPk.mockResolvedValue(mockOrder);

            await handleWebhook(req, res);

            expect(Order.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
            expect(mockOrder.update).toHaveBeenCalledWith(
                expect.objectContaining({ mpStatus: 'approved', status: 'paid' }),
                expect.any(Object)
            );
            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });

        it('should process refund on refunded payment status webhook', async () => {
            req.body = { type: 'payment', data: { id: 'pay_456' } };
            mockPaymentGet.mockResolvedValue({ id: 'pay_456', external_reference: '1', status: 'refunded' });

            const mockOrder = { 
                id: 1, 
                status: 'paid', 
                orderItems: [{ type: 'ticket', refId: 10, seats: 'A1, A2' }], 
                update: vi.fn() 
            };
            Order.findByPk.mockResolvedValue(mockOrder);

            await handleWebhook(req, res);

            expect(Seat.update).toHaveBeenCalledWith(
                { status: 'Libre' },
                expect.objectContaining({ where: { showingId: 10, label: ['A1', 'A2'] } })
            );
            expect(mockOrder.update).toHaveBeenCalledWith(
                { status: 'refunded', mpStatus: 'refunded' },
                expect.any(Object)
            );
            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
    });

    describe('refundPayment', () => {
        it('should return 404 if order does not exist', async () => {
            req.params = { orderId: 999 };
            Order.findByPk.mockResolvedValue(null);

            await refundPayment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Orden no encontrada" });
        });

        it('should return 403 if user is not order owner and not admin', async () => {
            req.params = { orderId: 1 };
            req.user = { id: 2, role: 'client' };
            const mockOrder = { id: 1, userId: 1, status: 'paid' };
            Order.findByPk.mockResolvedValue(mockOrder);

            await refundPayment(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "No autorizado" });
        });

        it('should return 400 if order status is not paid', async () => {
            req.params = { orderId: 1 };
            req.user = { id: 1, role: 'client' };
            const mockOrder = { id: 1, userId: 1, status: 'pending' };
            Order.findByPk.mockResolvedValue(mockOrder);

            await refundPayment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Solo se pueden reembolsar órdenes pagadas" });
        });

        it('should return 400 if showtime is within 2 hours or has passed for non-admin user', async () => {
            req.params = { orderId: 1 };
            req.user = { id: 1, role: 'client' };
            const soonDate = new Date(Date.now() + 3600000); // 1 hour in future (within 2h window)
            const mockOrder = { 
                id: 1, 
                userId: 1, 
                status: 'paid',
                orderItems: [{ type: 'ticket', refId: 5, seats: ['A1'] }]
            };
            Order.findByPk.mockResolvedValue(mockOrder);
            MovieShowing.findByPk.mockResolvedValue({ id: 5, showtime: soonDate });

            await refundPayment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                message: "No se pueden reembolsar entradas con menos de 2 horas de anticipación al inicio de la función" 
            });
        });

        it('should successfully process refund, restore product stock, and release seats for future showtime', async () => {
            req.params = { orderId: 1 };
            req.user = { id: 1, role: 'client' };
            const futureDate = new Date(Date.now() + 86400000);
            const mockOrder = { 
                id: 1, 
                userId: 1, 
                status: 'paid',
                total: 50.00,
                mpPaymentId: 'pay_123',
                orderItems: [
                    { type: 'product', refId: 101, quantity: 2 },
                    { type: 'ticket', refId: 5, seats: '["B1", "B2"]' }
                ],
                update: vi.fn().mockResolvedValue(true)
            };
            const mockProduct = { id: 101, stock: 5, save: vi.fn() };
            const mockUser = { id: 1, email: 'user@test.com', username: 'testuser' };

            Order.findByPk.mockResolvedValue(mockOrder);
            MovieShowing.findByPk.mockResolvedValue({ id: 5, showtime: futureDate });
            Products.findByPk.mockResolvedValue(mockProduct);
            User.findByPk.mockResolvedValue(mockUser);

            await refundPayment(req, res);

            expect(mockProduct.stock).toBe(7);
            expect(mockProduct.save).toHaveBeenCalled();
            expect(Seat.update).toHaveBeenCalledWith(
                { status: 'Libre' },
                expect.objectContaining({ where: { showingId: 5, label: ['B1', 'B2'] } })
            );
            expect(mockOrder.update).toHaveBeenCalledWith(
                { status: 'refunded', mpStatus: 'refunded' },
                expect.any(Object)
            );
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Reembolso procesado exitosamente"
            }));
        });
    });
});
