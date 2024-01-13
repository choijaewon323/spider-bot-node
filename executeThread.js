const {crawl} = require('./crawlingThread.js');
const Ticket = require('./classes/Ticket');

module.exports = async function executeCrawling (present, flag, cache) {
    let path = present[0];  // Array
    let cost = present[1];  // Integer
    let departureDate = present[2];

    if (flag == 0) {
        return await makeDirects();
    }

    return await makeStopovers();

    async function makeDirects() {
        let results = [];

        let parameter = [path[0], path[path.length - 1], departureDate];
        await directTicket(parameter, results);
        return results;
    }

    async function makeStopovers() {
        let results = [];

        await makeTicket(path, departureDate, [], 0, results, cache);

        return results;
    }
}

async function directTicket(parameter, tickets) {
    let routes = await crawl(parameter);

    for (let route of routes) {
        let stopover = [];
        stopover.push(route);

        tickets.push(new Ticket(stopover));
    }
}

async function makeTicket(path, departureDate, tempRoutes, presentIndex, tickets, cache) {
    if (isEnd(presentIndex, path)) {
        tickets.push(new Ticket(Object.assign([], tempRoutes)));
        
        return;
    }

    if (isStart(presentIndex)) {
        let routes = await caching(path, presentIndex, departureDate, cache);

        for (let route of routes) {
            let destinationDate = route.destinationDate;
    
            tempRoutes.push(route);
            await makeTicket(path, destinationDate, tempRoutes, presentIndex + 1, tickets, cache);
            tempRoutes.pop();
        }

        return;
    }
    
    let routes = await caching(path, presentIndex, departureDate, cache);

    for (let route of routes) {
        let tempDeparture = route.departureDate;
        let destinationDate = route.destinationDate;

        if (isTimeCorrect(departureDate, tempDeparture)) {
            tempRoutes.push(route);
            await makeTicket(path, destinationDate, tempRoutes, presentIndex + 1, tickets, cache);
            tempRoutes.pop();
        }
    }
}

function makeKey(start, end, departureDate) {
    let dateString = yearMonthDate(departureDate);

    return start + end + dateString;
}

function yearMonthDate(departureDate) {
    let year = String(departureDate.getUTCFullYear());
    let month = String(departureDate.getUTCMonth());
    let date = String(departureDate.getUTCDate());

    return year + month + date;
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

function isStart(index) {
    return (index == 0);
}

function isEnd(index, limit) {
    return (index == limit.length - 1);
}

async function caching(path, presentIndex, departureDate, cache) {
    let start = path[presentIndex];
    let end = path[presentIndex + 1];
    let parameter = [start, end, departureDate];
    
    const key = makeKey(start, end, departureDate);

    let results = await executeCaching(key, cache, parameter);

    return results;
}

async function executeCaching(key, cache, parameter) {
    if (cache.has(key)) {
        return cache.get(key);
    }

    const results = await crawl(parameter);
    cache.set(key, results);

    return results;
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