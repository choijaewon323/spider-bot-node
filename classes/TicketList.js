module.exports = class TicketList {
    tickets;

    constructor (tickets) {
        this.tickets = tickets;
    }

    get tickets() {
        return this.tickets;
    }
}