import React from "react";
import SeatSelector from "../components/SeatSelector";

export default function BuyTickets() {
    const handleConfirmSeats = (seats) => {
    console.log("Asientos seleccionados:", seats);
    // Acá podrías:
    // - Guardarlos en el backend
    // - Avanzar al pago
    };

    return (
    <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Compra de entradas</h1>
        <SeatSelector onConfirm={handleConfirmSeats} />
    </div>
    );
}
