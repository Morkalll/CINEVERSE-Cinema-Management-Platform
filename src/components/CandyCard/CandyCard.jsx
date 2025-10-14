
import './CandyCard.css';
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { successToast, errorToast } from "../../utils/toast";

export const CandyCard = ({ id, name, image, description, stock, price }) => {
    const { addToCart, getItemQuantity, updateQuantity, decrement, increment } = useCart();
    const { user } = useAuth();

    const qtyInCart = getItemQuantity(id, "product");

    const handleAddProduct = () => {
        if (stock !== undefined && qtyInCart >= stock) {
            errorToast("No hay suficiente stock");
            return;
        }
        if (!user) {
            errorToast("Debes iniciar sesión para comprar productos");
            return;
        }
        addToCart({
            refId: id,
            type: "product",
            name,
            price: Number(price ?? 0),
        }, 1);
        successToast(`${name} agregado al carrito`);
    };

    const handleMinus = () => {
        if (qtyInCart <= 0) return;
        updateQuantity(id, "product", qtyInCart - 1);
        successToast("Cantidad actualizada");
    };

    const handlePlus = () => {
        if (stock !== undefined && qtyInCart >= stock) {
            errorToast("No hay suficiente stock");
            return;
        }
        handleAddProduct();
    };

    return (
        <div className='candy-card'>
            <div className='candy-image-container'>
                <img src={image} alt={name} className='candy-image' />
            </div>

            <div className='candy-name'>{name}</div>

            <div className='Candy-Details'>
                <p className='candy-description'>{description}</p>
                <p className='candy-price'>Precio: ${price}</p>
                <p className='candy-available'>Disponible : {stock}</p>

                <div className='candy-bottom' style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className='add-button-new' onClick={handleMinus} aria-label={`Restar ${name}`}>-</button>

                    <div style={{ minWidth: 28, textAlign: "center" }}>{qtyInCart}</div>

                    <button className='add-button-new' onClick={handlePlus} aria-label={`Sumar ${name}`}>+</button>
                </div>
            </div>
        </div>
    );
};
