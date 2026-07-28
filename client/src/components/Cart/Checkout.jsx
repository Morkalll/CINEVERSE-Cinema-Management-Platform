
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { successToast, errorToast } from "../../utils/toast";
import { apiRequest } from "../../services/api";
import "./Checkout.css";


export const Checkout = () => 
{
    const { cart, total, removeFromCart, clearCart, increment, decrement } = useCart();
    const { token, user } = useAuth();
    const [submitting, setSubmitting] = useState(false);


 const handleConfirm = async () => 
    {
        if (!user) 
        {
            errorToast("Debes iniciar sesión para confirmar la compra");
            return;
        }

        if (cart.length === 0) 
        {
            errorToast("El carrito está vacío");
            return;
        }

        if (submitting) return;
        setSubmitting(true);

        try 
        {

            const items = cart.map((it) => ({
                type: it.type,
                refId: it.refId,
                quantity: it.quantity,
                seats: it.seats || undefined,
            }));

            const data = await apiRequest("/orders", "POST", { items }, token);

            // Create Mercado Pago preference and redirect to payment
            try {
                const prefData = await apiRequest("/payments/create-preference", "POST", { orderId: data.orderId }, token);
                clearCart();
                const paymentUrl = prefData.initPoint || prefData.sandboxInitPoint;
                if (paymentUrl) 
                {
                    window.location.href = paymentUrl;
                    return;
                } 
                else 
                {
                    errorToast("No se obtuvo enlace de pago de Mercado Pago.");
                }
            } catch (prefErr) {
                clearCart();
                console.error("Error al crear preferencia de pago:", prefErr);
                errorToast(prefErr.message || "Error al conectar con Mercado Pago.");
            }

            console.log("Order created:", data);
        } 
        
        catch (err) 
        {
            console.error(err);
            errorToast(err.message || "Error al procesar el pedido");
        }
        finally
        {
            setSubmitting(false);
        }
    };

    if (!cart || cart.length === 0) 
    {
        return (
            <div className="checkout-container cart-empty-container">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega productos o entradas antes de realizar la compra.</p>
            </div>
        );
    }


    return (
        <div className="checkout-container">
           
            <h2 className="checkout-title">🛒 Tu Carrito</h2>

            <div>
                
                {cart.map((item) => (

                    <div key={`${item.type}-${item.refId}`} className="cart-item-row">
                        
                        <div className="cart-item-info">
                            <div className="cart-item-name">{item.name}</div>
                            <div className="cart-item-type">{item.type}</div>
                        </div>

                        <div className="cart-item-controls">
                            
                            {item.type !== "ticket" ? (
                                <>
                                    <button className="btn-qty" onClick={() => decrement(item.refId, item.type, 1)} aria-label="Restar">-</button>
                                    <div style={{ minWidth: 28, textAlign: "center" }}>{item.quantity}</div>
                                    <button className="btn-qty" onClick={() => increment(item.refId, item.type, 1)} aria-label="Sumar">+</button>
                                </>
                            ) : (
                                <div style={{ minWidth: 28, textAlign: "center" }}>Cant: {item.quantity}</div>
                            )}
                            

                            <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>

                            <button className="btn-remove" onClick={() => { removeFromCart(item.refId, item.type); successToast("Producto eliminado"); }}>Eliminar</button>
                        
                        </div>

                    </div>

                ))}

            </div>


            <div className="checkout-footer">
                
                <div>
                    <button className="btn-clear" onClick={() => { clearCart(); successToast("Carrito vaciado"); }}>Vaciar carrito</button>
                </div>

                <div className="checkout-total">
                    Total: ${total.toFixed(2)}
                </div>

            </div>


            <div style={{ marginTop: 16 }}>
               
                <button className="btn-checkout-confirm" onClick={handleConfirm} disabled={submitting}>
                    {submitting ? "Procesando..." : "Confirmar Pedido"}
                </button>
            
            </div>
        
        </div>

    );

};

