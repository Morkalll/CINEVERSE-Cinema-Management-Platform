import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, cancelOrder } from './order.services.js';
import Order from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { sequelize } from '../db.js';
import { MovieShowing } from '../models/MovieShowing.js';
import { Products } from '../models/Products.js';
import { Seat } from '../models/Seats.js';
import { User } from '../models/User.js';
import * as emailServices from './email.services.js';

// Mock dependencies
vi.mock('../models/Order.js', () => {
    return { default: { create: vi.fn(), findByPk: vi.fn(), findAll: vi.fn() } };
});
vi.mock('../models/OrderItem.js', () => {
    return { OrderItem: { create: vi.fn(), findAll: vi.fn(), destroy: vi.fn() } };
});
vi.mock('../models/MovieShowing.js', () => {
    return { MovieShowing: { findByPk: vi.fn() } };
});
vi.mock('../models/Products.js', () => {
    return { Products: { findByPk: vi.fn() } };
});
vi.mock('../models/Seats.js', () => {
    return { Seat: { findAll: vi.fn(), update: vi.fn() } };
});
vi.mock('../models/User.js', () => {
    return { User: { findByPk: vi.fn() } };
});
vi.mock('./email.services.js', () => ({
    sendOrderConfirmationEmail: vi.fn(),
    sendOrderCancellationEmail: vi.fn()
}));

const mockTransaction = {
    commit: vi.fn(),
    rollback: vi.fn(),
    LOCK: { UPDATE: 'UPDATE' }
};

vi.mock('../db.js', () => ({
    sequelize: {
        transaction: vi.fn(() => mockTransaction)
    }
}));


describe('Order Services - createOrder', () => {
    
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
            json: vi.fn()
        };
    });

    it('should return 401 if user is not authenticated', async () => {
        req.user = null;
        await createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "No autenticado" });
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should return 400 if cart is empty', async () => {
        req.body.items = [];
        await createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Carrito vacío" });
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should successfully create an order for a product', async () => {
        req.body.items = [
            { type: "product", refId: 10, quantity: 2 }
        ];

        const mockOrder = { id: 99, total: 0, save: vi.fn() };
        Order.create.mockResolvedValue(mockOrder);

        const mockProduct = { id: 10, name: "Popcorn", price: 5.0, stock: 10, save: vi.fn() };
        Products.findByPk.mockResolvedValue(mockProduct);

        User.findByPk.mockResolvedValue({ id: 1, email: "test@test.com", username: "test" });

        await createOrder(req, res);

        expect(Order.create).toHaveBeenCalledWith({ userId: 1, total: 0 }, { transaction: mockTransaction });
        expect(Products.findByPk).toHaveBeenCalledWith(10, { transaction: mockTransaction, lock: 'UPDATE' });
        expect(mockProduct.stock).toBe(8); // 10 - 2
        expect(mockProduct.save).toHaveBeenCalled();
        expect(OrderItem.create).toHaveBeenCalledWith(
            expect.objectContaining({ orderId: 99, type: "product", refId: 10, quantity: 2, price: 5.0 }),
            { transaction: mockTransaction }
        );
        expect(mockOrder.total).toBe(10.0); // 5.0 * 2
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ orderId: 99, total: 10.0 });
        expect(emailServices.sendOrderConfirmationEmail).toHaveBeenCalled();
    });

    it('should fail if product has insufficient stock', async () => {
        req.body.items = [
            { type: "product", refId: 10, quantity: 20 } // wants 20
        ];

        const mockOrder = { id: 99, total: 0, save: vi.fn() };
        Order.create.mockResolvedValue(mockOrder);

        const mockProduct = { id: 10, name: "Popcorn", price: 5.0, stock: 10, save: vi.fn() }; // only has 10
        Products.findByPk.mockResolvedValue(mockProduct);

        await createOrder(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Stock insuficiente para Popcorn" });
    });

    it('should successfully create an order for a ticket', async () => {
        req.body.items = [
            { type: "ticket", refId: 5, quantity: 1, seats: ["A1"] }
        ];

        const mockOrder = { id: 100, total: 0, save: vi.fn() };
        Order.create.mockResolvedValue(mockOrder);

        const mockShow = { id: 5, ticketPrice: 15.0, screenId: 2 };
        MovieShowing.findByPk.mockResolvedValue(mockShow);

        const mockSeat = { label: "A1", status: 'Libre' };
        Seat.findAll.mockResolvedValue([mockSeat]);

        await createOrder(req, res);

        expect(Seat.findAll).toHaveBeenCalled();
        expect(Seat.update).toHaveBeenCalledWith(
            { status: 'Reservado' },
            expect.objectContaining({ transaction: mockTransaction })
        );
        expect(OrderItem.create).toHaveBeenCalledWith(
            expect.objectContaining({ orderId: 100, type: "ticket", price: 15.0 }),
            { transaction: mockTransaction }
        );
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
