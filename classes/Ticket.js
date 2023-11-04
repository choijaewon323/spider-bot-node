module.exports = class Ticket {
    path;   // Array<string>
    routes; // Array<Route>

    constructor (path, routes) {
        this.path = path;
        this.routes = routes;
    }

    get path() {
        return this.path;
    }

    get routes() {
        return this.routes;
    }
}