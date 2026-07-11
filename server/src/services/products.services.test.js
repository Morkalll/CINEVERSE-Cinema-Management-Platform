import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAllProducts, findOneProduct, createProduct, updateProduct, deleteProduct } from './products.services.js';
import { Products } from '../models/Products.js';

vi.mock('../models/Products.js', () => ({
    Products: {
        findAll: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        findByPk: vi.fn()
    }
}));

describe('Products Services', () => {
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

    describe('findAllProducts', () => {
        it('should return all products', async () => {
            const products = [{ id: 1, name: 'Popcorn' }];
            Products.findAll.mockResolvedValue(products);

            await findAllProducts(req, res);

            expect(Products.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(products);
        });

        it('should return 500 on error', async () => {
            Products.findAll.mockRejectedValue(new Error('DB Error'));
            await findAllProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('findOneProduct', () => {
        it('should return 404 if product not found', async () => {
            req.params.id = 1;
            Products.findOne.mockResolvedValue(null);

            await findOneProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return product if found', async () => {
            req.params.id = 1;
            const product = { id: 1, name: 'Popcorn' };
            Products.findOne.mockResolvedValue(product);

            await findOneProduct(req, res);
            expect(res.json).toHaveBeenCalledWith(product);
        });
    });

    describe('createProduct', () => {
        it('should return 400 if required fields are missing', async () => {
            req.body = { name: 'Popcorn' }; // missing price
            await createProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should create product successfully', async () => {
            req.body = { name: 'Popcorn', price: 10 };
            Products.create.mockResolvedValue({ id: 1, ...req.body });

            await createProduct(req, res);

            expect(Products.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateProduct', () => {
        it('should return 404 if not found', async () => {
            req.params.id = 1;
            Products.findByPk.mockResolvedValue(null);

            await updateProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should update product successfully', async () => {
            req.params.id = 1;
            req.body = { price: 15 };
            const mockProduct = { id: 1, name: 'Popcorn', update: vi.fn().mockResolvedValue(true) };
            Products.findByPk.mockResolvedValue(mockProduct);

            await updateProduct(req, res);
            expect(mockProduct.update).toHaveBeenCalledWith({ price: 15 });
            expect(res.json).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('deleteProduct', () => {
        it('should return 404 if not found', async () => {
            req.params.id = 1;
            Products.findByPk.mockResolvedValue(null);

            await deleteProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should destroy product', async () => {
            req.params.id = 1;
            const mockProduct = { id: 1, destroy: vi.fn() };
            Products.findByPk.mockResolvedValue(mockProduct);

            await deleteProduct(req, res);
            expect(mockProduct.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
