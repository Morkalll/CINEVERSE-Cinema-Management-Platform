import { Movie } from "./movie.js";
import { Room } from "./room.js";

export class ShowTime {
    constructor(id, movie, room, startsAt, price) {
        this.id = id;
        this.movie = movie;
        this.room = room;
        this.startsAt = startsAt;
        this.price = price;
        this.seats = [];
        this.initSeats();
    }

    // Inicializa asientos como "F" => Free
    initSeats() {
        for (let i = 0; i < this.room.capacity; i++) {
            this.seats.push("F");
        }
    }

    showSeats() {
        console.log("Asientos:", this.seats.join(" "));
    }

    availableCount() {
        return this.seats.filter(seat => seat === "F").length;
    }

    isSeatAvailable(index) {
        return this.seats[index] === "F";
    }

    reserveSeat(index) {
        if (this.isSeatAvailable(index)) {
            this.seats[index] = "R"; // R => Reserved
            return true;
        }
        return false;
    }

    sellSeat(index) {
        if (this.seats[index] === "F" || this.seats[index] === "R") {
            this.seats[index] = "S"; // S => Sold
            return true;
        }
        return false;
    }
}

