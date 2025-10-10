
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { successToast, errorToast } from "../../utils/toast";
import { API_URL } from "../../services/api";

export const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const { token, user } = useAuth();

    const handleCheckout = async () => {
        if (cart.length === 0) {
            errorToast("Tu carrito está vacío");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user?.id,
                    items: cart.map((item) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    total,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Error al procesar el pedido");
            }

            successToast("¡Compra realizada con éxito!");
            clearCart();
        } catch (err) {
            errorToast(err.message);
        }
    };

    return (
        <div>
            <h2>Tu pedido</h2>
            {cart.length === 0 ? (
                <p>No hay productos en el carrito.</p>
            ) : (
                <ul>
                    {cart.map((item) => (
                        <li key={item.id}>
                            {item.name} — {item.quantity} × ${item.price}
                        </li>
                    ))}
                </ul>
            )}
            <h4>Total: ${total}</h4>
            <button onClick={handleCheckout}>Confirmar compra</button>
        </div>
    );
};
