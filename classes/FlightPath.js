class FlightPath {
    path;
    totalCost;

    constructor () {}

    constructor(path, cost) {
        this.path = path;
        this.cost = cost;
    }

    get path() {
        return this.path;
    }

    get cost() {
        return this.cost;
    }

    set path(path) {
        this.path = path;
    }

    set cost(cost) {
        this.cost = cost;
    }
}

module.exports = {
    FlightPath
}