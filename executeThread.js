const crawl = require('./crawlingThread.js');

const Ticket = require('./classes/Ticket');

module.exports = async function executeCrawling (present) {
    let path = present[0];  // Array
    let cost = present[1];  // Integer
    let departureDate = present[2];

    //console.log("ENTER THREAD");

    let tickets = [];

    await makeTicket(path, departureDate, [], 0, tickets);

    return tickets;
}

async function makeTicket(path, departureDate, tempRoutes, presentIndex, tickets) {
    if (presentIndex == path.length - 1) {
        tickets.push(new Ticket(Object.assign([], tempRoutes)));
        
        return;
    }
    
    let start = path[presentIndex];
    let end = path[presentIndex + 1];
    let parameter = [start, end, departureDate];

    let routes = await crawl(parameter);

    for (let route of routes) {
        let destinationDate = route.destinationDate;

        let diffMSec = destinationDate - departureDate;
        let diffDate = diffMSec / (24 * 60 * 60 * 1000);
        let diffMin = diffMSec / (60 * 1000);
        
        if (diffDate >= 1 || diffMin >= 30) {
            tempRoutes.push(route);
            await makeTicket(path, destinationDate, tempRoutes, presentIndex + 1, tickets);
            tempRoutes.pop();
        }
    }
}