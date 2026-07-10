import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPreference, handleWebhook } from './payment.services.js';
import Order from '../models/Order.js';

// Mocks
vi.mock('../models/Order.js', () => {
    return { default: { findByPk: vi.fn(), update: vi.fn() } };
});

vi.mock('mercadopago', () => {
    return {
        MercadoPagoConfig: class {},
        Preference: class {
            create = vi.fn().mockResolvedValue({ id: 'pref_123', init_point: 'url1', sandbox_init_point: 'url2' })
        },
        Payment: class {
            get = vi.fn().mockResolvedValue({ id: 'pay_456', external_reference: '1', status: 'approved' })
        }
    };
});

describe('Payment Services', () => {
    
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = {
            user: { id: 1 },
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

            const mockOrder = { id: 1, update: vi.fn() };
            Order.findByPk.mockResolvedValue(mockOrder);

            await handleWebhook(req, res);

            expect(Order.findByPk).toHaveBeenCalledWith('1');
            expect(mockOrder.update).toHaveBeenCalledWith(
                expect.objectContaining({ mpStatus: 'approved', status: 'paid' })
            );
            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
    });
});
