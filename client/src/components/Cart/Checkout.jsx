
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { successToast, errorToast } from "../../utils/toast";
import { apiRequest } from "../../services/api";


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
            <div className="p-6 text-center">
                
                <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>

                <p>Agrega productos o entradas antes de realizar la compra.</p>

            </div>
        );
    }


    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md max-w-3xl mx-auto mt-6">
           
            <h2 className="text-2xl font-bold mb-4 text-center">🛒 Tu Carrito</h2>

            <div>
                
                {cart.map((item) => (

                    <div key={`${item.type}-${item.refId}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                        
                        <div style={{ flex: 1 }}>

                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            

                            <div style={{ fontSize: 13, color: "#666" }}>{item.type}</div>
                            

                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            
                            {item.type !== "ticket" ? (
                                <>
                                    <button onClick={() => decrement(item.refId, item.type, 1)} aria-label="Restar">-</button>
                                    <div style={{ minWidth: 28, textAlign: "center" }}>{item.quantity}</div>
                                    <button onClick={() => increment(item.refId, item.type, 1)} aria-label="Sumar">+</button>
                                </>
                            ) : (
                                <div style={{ minWidth: 28, textAlign: "center" }}>{item.quantity}</div>
                            )}
                            

                            <div style={{ width: 90, textAlign: "right" }}>${(item.price * item.quantity).toFixed(2)}</div>


                            <button onClick={() => { removeFromCart(item.refId, item.type); successToast("Producto eliminado"); }} style={{ marginLeft: 12 }}>Eliminar</button>
                        
                        </div>

                    </div>

                ))}

            </div>


            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "center" }}>
                
                <div>

                    <button onClick={() => { clearCart(); successToast("Carrito vaciado"); }} style={{ marginRight: 8 }}>Vaciar carrito</button>
                
                </div>

                <div style={{ fontWeight: 700, fontSize: 18 }}>
                    
                    Total: ${total.toFixed(2)}
                
                </div>

            </div>


            <div style={{ marginTop: 16 }}>
               
                <button onClick={handleConfirm} disabled={submitting} style={{ width: "100%", padding: "10px 14px", background: submitting ? "#555" : "#0a0a0a", color: "#fff", borderRadius: 6 }}>
                    
                    {submitting ? "Procesando..." : "Confirmar Pedido"}
                
                </button>
            
            </div>
        
        </div>

    );

};
