module.exports = class Task {
    departure;
    destination;
    departureDate;
    paths;

    constructor(departure, destination, departureDate, paths) {
        this.departure = departure;
        this.destination = destination;
        this.departureDate = departureDate;
        this.paths = paths;
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

    get paths() {
        return this.paths;
    }
}