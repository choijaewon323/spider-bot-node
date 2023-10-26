class Pair {
    departure;
    destination;

    constructor () {}
    
    constructor(departure, destination) {
        this.departure = departure;
        this.destination = destination;
    }

    get departure() {
        return this.departure;
    }

    get destination() {
        return this.destination;
    }

    set departure(departure) {
        this.departure = departure;
    }

    set destination(destination) {
        this.destination = destination;
    }
}

module.exports = {
    new Pair
}