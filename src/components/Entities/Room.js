class Room {
    constructor(id, name, capacity){
        this.id = id;
        this.name = name;
        this.capacity = capacity;

    }

    info(){
        console.log('${this.name} tiene ${this.capacity} asientos.');
    }
}

export default Room;