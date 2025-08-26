import Showtime from "./Showtime";

class Ticket {
    constructor(id, showtime, seatIndex, user) {
        this.id = id;
        this.showtime = showtime;
        this.seatIndex = seatIndex;
        this.user = user;
        this.status = "reserved"; // Literalmente estado
    }

    pay() {
        if (this.status === "reserved") {
            this.status = "paid";
            this.showtime.sellSeat(this.seatIndex);
            return true;
        }
        return false;
    }

    info() {
        console.log(
            `Ticket #${this.id} | Función: ${this.showtime.movie.title} | Asiento: ${this.seatIndex} | Usuario: ${this.user} | Estado: ${this.status}`
        );
    }
}

export default Ticket;
