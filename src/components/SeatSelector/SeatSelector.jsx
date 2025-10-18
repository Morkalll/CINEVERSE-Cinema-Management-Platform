import React, { useState } from "react";
import { SeatPicker } from "react-seat-toolkit";

export default function SeatSelector({ onConfirm }) {
const [selectedSeats, setSelectedSeats] = useState([]);

const handleSeatClick = (seat) => {
    setSelectedSeats((prev) =>
        prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
};

const handleConfirm = () => {
    if (onConfirm) onConfirm(selectedSeats);
};

return (
    <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">Seleccioná tus asientos</h2>

        <SeatPicker
            rows={6}
            seatsPerRow={10}
            maxReservableSeats={5}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
        />

    <button
        onClick={handleConfirm}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
        Confirmar selección
    </button>
    </div>
);
}
