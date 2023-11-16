module.exports = class Route {
    airline;
    flightNumber;   // 0
    departureTime;
    destinationTime;
    price;
    departure;
    destination;
    link;   // #
    timeTaken;
    isSoldOut;  // false;

    constructor (airline, departure, destination, departureTime, destinationTime, timeTaken, price) {
        this.airline = airline;
        this.departure = departure;
        this.destination = destination;
        this.departureTime = departureTime;
        this.destinationTime = destinationTime;
        this.timeTaken = timeTaken;
        this.price = price;
        this.flightNumber = 0;
        this.link = "#";
        this.isSoldOut = false;
    }

    get flightNumber() {
        return this.flightNumber;
    }

    get link() {
        return this.link;
    }

    get isSoldOut() {
        return this.isSoldOut;
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