module.exports = class Ticket {
    stopover; // Array<Route>

    constructor (stopover) {
        this.stopover = stopover;
    }

    get stopover() {
        return this.stopover;
    }
}