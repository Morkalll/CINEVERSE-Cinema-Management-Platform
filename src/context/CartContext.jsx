import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Cargar desde localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) setCart(JSON.parse(storedCart));
    }, []);

    // Guardar automáticamente cada vez que cambie
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Agregar item
    const addToCart = (item, quantity = 1) => {
        setCart((prevCart) => {
            const existing = prevCart.find((p) => p.id === item.id);

            if (existing) {
                return prevCart.map((p) =>
                    p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
                );
            }

            return [...prevCart, { ...item, quantity }];
        });
    };

    // Eliminar item
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((p) => p.id !== id));
    };

    // Cambiar cantidad manualmente
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) return removeFromCart(id);

        setCart((prevCart) =>
            prevCart.map((p) =>
                p.id === id ? { ...p, quantity: newQuantity } : p
            )
        );
    };

    // Vaciar carrito
    const clearCart = () => setCart([]);

    // Total general
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
