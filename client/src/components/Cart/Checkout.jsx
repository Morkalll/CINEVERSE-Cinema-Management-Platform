
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { successToast, errorToast } from "../../utils/toast";
import { API_URL } from "../../services/api";


export const Checkout = () => 
{
    const { cart, total, removeFromCart, clearCart, increment, decrement } = useCart();
    const { token, user } = useAuth();


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

        try 
        {
            const items = cart.map((it) => (
            {
                type: it.type,
                refId: it.refId,
                quantity: it.quantity,
            }));

            const res = await fetch((API_URL) + "/orders", 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ items }),
            });

            if (!res.ok) 
            {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message || "Error al crear pedido");
            }

            const data = await res.json();

            successToast("Pedido realizado con éxito");

            clearCart();

            console.log("Order created:", data);

        } 
        
        catch (err) 
        {
            console.error(err);
            errorToast(err.message || "Error al procesar el pedido");
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
                            
                            <button onClick={() => decrement(item.refId, item.type, 1)} aria-label="Restar">-</button>

                            <div style={{ minWidth: 28, textAlign: "center" }}>{item.quantity}</div>


                            <button onClick={() => increment(item.refId, item.type, 1)} aria-label="Sumar">+</button>

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
               
                <button onClick={handleConfirm} style={{ width: "100%", padding: "10px 14px", background: "#0a0a0a", color: "#fff", borderRadius: 6 }}>
                    
                    Confirmar Pedido
                
                </button>
            
            </div>
        
        </div>

    );

};
