module.exports = class Route {
    airline;
    departure;
    destination;
    departureTime;
    arrivedTime;
    timeTaken;
    price;

    constructor (airline, departure, destination, departureTime, arrivedTime, timeTaken, price) {
        this.airline = airline;
        this.departure = departure;
        this.destination = destination;
        this.departureTime = departureTime;
        this.arrivedTime = arrivedTime;
        this.timeTaken = timeTaken;
        this.price = price;
    }

    get airline() {
        return this.airline;
    }

    get departure() {
        return this.departure;
    }

    get destination() {
        return this.destination;
    }

    get departureTime() {
        return this.departureTime;
    }

    get arrivedTime() {
        return this.arrivedTime;
    }

    get timeTaken() {
        return this.timeTaken;
    }

    get price() {
        return this.price;
    }
}