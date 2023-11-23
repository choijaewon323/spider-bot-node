module.exports = class Route {
    airline;
    flightNumber;   // 0
    departureDate;
    destinationDate;
    price;
    departure;
    destination;
    link;   // #
    timeTaken;
    isSoldOut;  // false;

    constructor (airline, departure, destination, departureDate, destinationDate, timeTaken, price, flightNumber, isSoldOut, link) {
        this.airline = airline;
        this.departure = departure;
        this.destination = destination;
        this.departureDate = departureDate;
        this.destinationDate = destinationDate;
        this.timeTaken = timeTaken;
        this.price = price;
        this.flightNumber = flightNumber;
        this.link = link;
        this.isSoldOut = isSoldOut;
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

    get departureDate() {
        return this.departureDate;
    }

    get destinationDate() {
        return this.destinationDate;
    }

    get timeTaken() {
        return this.timeTaken;
    }

    get price() {
        return this.price;
    }
}