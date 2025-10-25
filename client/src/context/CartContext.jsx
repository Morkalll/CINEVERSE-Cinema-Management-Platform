
import { createContext, useContext, useEffect, useState } from "react";


const CartContext = createContext();

export const CartProvider = ({ children }) => 
{
    const [cart, setCart] = useState([]);

    useEffect(() => 
    {
        try 
        {
            const raw = localStorage.getItem("cart");

            if (raw) 
            {
                setCart(JSON.parse(raw));
            }
        } 
        
        catch (error) 
        {
            console.warn("No se pudo traer el carrito del localStorage", error);
            setCart([]);
        }

    }, []);


    useEffect(() => 
    {
        try 
        {
            localStorage.setItem("cart", JSON.stringify(cart));
        } 
        
        catch (error) 
        {
            console.warn("No se pudo actualizar el carrito en el localStorage", error);
        }

    }, [cart]);


    const findIndex = (refId, type) => cart.findIndex((item) => item.refId === refId && item.type === type);


    const addToCart = (item, quantity = 1) => 
    {
        if (!item || item.refId == null || !item.type)
        {
            console.warn("Item inválido", item);
            return;
        }

        setCart((prev) => 
        {
            const idx = prev.findIndex((item) => item.refId === item.refId && item.type === item.type);

            if (idx >= 0) 
            {
                const newCart = [...prev];
                newCart[idx] = { ...newCart[idx], quantity: Number(newCart[idx].quantity || 0) + Number(quantity) };
                return newCart;
            } 
            
            else 
            {
                return [...prev, { ...item, quantity: Number(quantity) }];
            }

        });

    };


    const removeFromCart = (refId, type) => 
    {
        setCart((prev) => prev.filter((item) => !(item.refId === refId && item.type === type)));
    };


    const updateQuantity = (refId, type, newQuantity) => 
    {
        newQuantity = Number(newQuantity);

        if (Number.isNaN(newQuantity))
        { 
            return;
        }

        setCart((prev) => 
        {
            if (newQuantity <= 0)
            {
                return prev.filter((item) => !(item.refId === refId && item.type === type));
            }

            return prev.map((item) => (item.refId === refId && item.type === type ? { ...item, quantity: newQuantity } : item));
        });

    };


    const increment = (refId, type, step = 1) => 
    {
        const idx = findIndex(refId, type);

        if (idx === -1)
        { 
            return;
        }

        const current = cart[idx].quantity || 0;

        updateQuantity(refId, type, current + step);
    };


    const decrement = (refId, type, step = 1) => 
    {
        const idx = findIndex(refId, type);

        if (idx === -1) 
        {
            return;
        }

        const current = cart[idx].quantity || 0;

        updateQuantity(refId, type, current - step);
    };


    const clearCart = () => setCart([]);


    const total = cart.reduce((summatory, item) => summatory + Number(item.price || 0) * Number(item.quantity || 0), 0);


    const itemCount = cart.reduce((summatory, item) => summatory + Number(item.quantity || 0), 0);


    const getItemQuantity = (refId, type) => 
    {
        const found = cart.find((item) => item.refId === refId && item.type === type);

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
        }}>
        
        {children}

        </CartContext.Provider>
    );

};


export const useCart = () => useContext(CartContext);

