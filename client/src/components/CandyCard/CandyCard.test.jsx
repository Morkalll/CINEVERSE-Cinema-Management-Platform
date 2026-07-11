import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CandyCard } from './CandyCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { successToast, errorToast } from '../../utils/toast';

vi.mock('../../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../utils/toast', () => ({
    successToast: vi.fn(),
    errorToast: vi.fn()
}));

describe('CandyCard', () => {
    const mockAddToCart = vi.fn();
    const mockUpdateQuantity = vi.fn();
    const mockGetItemQuantity = vi.fn();

    const defaultProps = {
        id: 1,
        name: 'Popcorn',
        image: 'popcorn.jpg',
        description: 'Delicious popcorn',
        stock: 10,
        price: 5
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        useCart.mockReturnValue({
            addToCart: mockAddToCart,
            updateQuantity: mockUpdateQuantity,
            getItemQuantity: mockGetItemQuantity
        });

        useAuth.mockReturnValue({
            user: { id: 1, name: 'Test User' }
        });

        mockGetItemQuantity.mockReturnValue(0);
    });

    it('renders correctly with given props', () => {
        render(<CandyCard {...defaultProps} />);
        
        expect(screen.getByText('Popcorn')).toBeInTheDocument();
        expect(screen.getByText('Delicious popcorn')).toBeInTheDocument();
        expect(screen.getByText('Precio: $5')).toBeInTheDocument();
        expect(screen.getByText('Disponible: 10')).toBeInTheDocument();
        expect(screen.getByAltText('Popcorn')).toHaveAttribute('src', 'popcorn.jpg');
    });

    it('adds product to cart when + is clicked', () => {
        render(<CandyCard {...defaultProps} />);
        
        const addButton = screen.getByRole('button', { name: 'Sumar Popcorn' });
        fireEvent.click(addButton);

        expect(mockAddToCart).toHaveBeenCalledWith({
            refId: 1,
            type: 'product',
            name: 'Popcorn',
            price: 5
        }, 1);
        expect(successToast).toHaveBeenCalledWith('Popcorn agregado al carrito');
    });

    it('shows error if not logged in when adding product', () => {
        useAuth.mockReturnValue({ user: null });
        render(<CandyCard {...defaultProps} />);
        
        const addButton = screen.getByRole('button', { name: 'Sumar Popcorn' });
        fireEvent.click(addButton);

        expect(mockAddToCart).not.toHaveBeenCalled();
        expect(errorToast).toHaveBeenCalledWith('Debes iniciar sesión para comprar productos');
    });

    it('shows error if stock is exceeded when adding product', () => {
        mockGetItemQuantity.mockReturnValue(10); // same as stock
        render(<CandyCard {...defaultProps} />);
        
        const addButton = screen.getByRole('button', { name: 'Sumar Popcorn' });
        fireEvent.click(addButton);

        expect(mockAddToCart).not.toHaveBeenCalled();
        expect(errorToast).toHaveBeenCalledWith('No hay suficiente stock');
    });

    it('decreases product quantity when - is clicked', () => {
        mockGetItemQuantity.mockReturnValue(2);
        render(<CandyCard {...defaultProps} />);
        
        const removeButton = screen.getByRole('button', { name: 'Restar Popcorn' });
        fireEvent.click(removeButton);

        expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 'product', 1);
        expect(successToast).toHaveBeenCalledWith('Cantidad actualizada');
    });

    it('does not decrease quantity if it is 0', () => {
        mockGetItemQuantity.mockReturnValue(0);
        render(<CandyCard {...defaultProps} />);
        
        const removeButton = screen.getByRole('button', { name: 'Restar Popcorn' });
        fireEvent.click(removeButton);

        expect(mockUpdateQuantity).not.toHaveBeenCalled();
    });
});
