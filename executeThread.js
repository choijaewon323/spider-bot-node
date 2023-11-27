const {crawl} = require('./crawlingThread.js');
const Ticket = require('./classes/Ticket');

module.exports = async function executeCrawling (present, flag) {
    let path = present[0];  // Array
    let cost = present[1];  // Integer
    let departureDate = present[2];

    let tickets = [];

    let parameter = [path[0], path[1], departureDate];
    await directTicket(parameter, tickets);
    // await makeTicket(path, departureDate, [], 0, tickets);

    return tickets;
}

async function directTicket(parameter, tickets) {
    let routes = await crawl(parameter);

    for (let route of routes) {
        let stopover = [];
        stopover.push(route);

        tickets.push(new Ticket(stopover));
    }
}

async function makeTicket(path, departureDate, tempRoutes, presentIndex, tickets) {
    if (presentIndex == path.length - 1) {
        tickets.push(new Ticket(Object.assign([], tempRoutes)));
        
        return;
    }

    if (presentIndex == 0) {
        let start = path[presentIndex];
        let end = path[presentIndex + 1];
        let parameter = [start, end, departureDate];

        let routes = await crawl(parameter);

        for (let route of routes) {
            let destinationDate = route.destinationDate;
    
            tempRoutes.push(route);
            await makeTicket(path, destinationDate, tempRoutes, presentIndex + 1, tickets);
            tempRoutes.pop();
        }

        return;
    }
    
    let start = path[presentIndex];
    let end = path[presentIndex + 1];
    let parameter = [start, end, departureDate];

    let routes = await crawl(parameter);

    for (let route of routes) {
        let tempDeparture = route.departureDate;
        let destinationDate = route.destinationDate;

        if (isTimeCorrect(departureDate, tempDeparture)) {
            tempRoutes.push(route);
            await makeTicket(path, destinationDate, tempRoutes, presentIndex + 1, tickets);
            tempRoutes.pop();
        }
    }
}

function isTimeCorrect(departureDate, destinationDate) {
    let diffDate = destinationDate.getUTCDate() - departureDate.getUTCDate();

    if (diffDate >= 1) {
        return true;
    }

    let diffHours = destinationDate.getUTCHours() - departureDate.getUTCHours();

    if (diffDate == 0 && diffHours >= 1) {
        return true;
    }

    let diffMin = destinationDate.getUTCMinutes() - departureDate.getUTCMinutes();

    if (diffDate == 0 && diffHours == 0 && diffMin >= 30) {
        return true;
    }

    return false;
}

/*
async function makeTicketByKoreanAir(path, departureDate, tempRoutes, presentIndex, tickets) {
    if (presentIndex == path.length - 1) {
        tickets.push(new Ticket(Object.assign([], tempRoutes)));
        
        return;
    }
    
    let start = path[presentIndex];
    let end = path[presentIndex + 1];
    let parameter = [start, end, departureDate];

    let routes = await koreanAirCrawl(parameter);

    for (let route of routes) {
        let destinationDate = route.destinationDate;

        let diffMSec = destinationDate - departureDate;
        let diffDate = diffMSec / (24 * 60 * 60 * 1000);
        let diffMin = diffMSec / (60 * 1000);
        
        if (diffDate >= 1 || diffMin >= 30) {
            tempRoutes.push(route);
            await makeTicketByKoreanAir(path, destinationDate, tempRoutes, presentIndex + 1, tickets);
            tempRoutes.pop();
        }
    }
}
*/