
import { Checkout } from "../../../components/Cart/Checkout";
import { NavBar } from "../../NavBar/NavBar";

export const CheckoutPage = () => {
    return (
        <div className="NavBar">

            <NavBar />

            <h1 className="mb-4 text-center">Finalizar Compra</h1>
            <Checkout />

        </div>
    );
};
