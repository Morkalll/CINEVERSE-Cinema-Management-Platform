
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load from localStorage on init
    useEffect(() => {
        try {
            const raw = localStorage.getItem("cart");
            if (raw) setCart(JSON.parse(raw));
        } catch (e) {
            console.warn("Cart: unable to parse localStorage cart", e);
            setCart([]);
        }
    }, []);

    // Persist changes
    useEffect(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(cart));
        } catch (e) {
            console.warn("Cart: unable to persist cart", e);
        }
    }, [cart]);

    // Helpers
    const findIndex = (refId, type) => cart.findIndex((i) => i.refId === refId && i.type === type);

    // Add item. item must include: refId, type ('ticket'|'product'), name, price
    const addToCart = (item, qty = 1) => {
        if (!item || item.refId == null || !item.type) {
            console.warn("addToCart: invalid item", item);
            return;
        }
        setCart((prev) => {
            const idx = prev.findIndex((p) => p.refId === item.refId && p.type === item.type);
            if (idx >= 0) {
                const newCart = [...prev];
                newCart[idx] = { ...newCart[idx], quantity: Number(newCart[idx].quantity || 0) + Number(qty) };
                return newCart;
            } else {
                return [...prev, { ...item, quantity: Number(qty) }];
            }
        });
    };

    const removeFromCart = (refId, type) => {
        setCart((prev) => prev.filter((p) => !(p.refId === refId && p.type === type)));
    };

    const updateQuantity = (refId, type, newQty) => {
        newQty = Number(newQty);
        if (Number.isNaN(newQty)) return;
        setCart((prev) => {
            if (newQty <= 0) {
                return prev.filter((p) => !(p.refId === refId && p.type === type));
            }
            return prev.map((p) => (p.refId === refId && p.type === type ? { ...p, quantity: newQty } : p));
        });
    };

    const increment = (refId, type, step = 1) => {
        const idx = findIndex(refId, type);
        if (idx === -1) return; // not found
        const current = cart[idx].quantity || 0;
        updateQuantity(refId, type, current + step);
    };

    const decrement = (refId, type, step = 1) => {
        const idx = findIndex(refId, type);
        if (idx === -1) return;
        const current = cart[idx].quantity || 0;
        updateQuantity(refId, type, current - step);
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);

    const itemCount = cart.reduce((s, it) => s + Number(it.quantity || 0), 0);

    const getItemQuantity = (refId, type) => {
        const found = cart.find((p) => p.refId === refId && p.type === type);
        return found ? Number(found.quantity || 0) : 0;
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                increment,
                decrement,
                clearCart,
                total,
                itemCount,
                getItemQuantity,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
