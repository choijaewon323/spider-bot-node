const crawl = require('./crawlingThread.js');

const Ticket = require('./classes/Ticket');

module.exports = async function executeCrawling (present) {
    let path = present[0];  // Array
    let cost = present[1];  // Integer
    let departureDate = present[2];
    let pathLength = path.length;

    let resultPerRoute = [];

    //console.log("executeCrawling entered");

    let flag = true;
    for (let i = 0; i < pathLength - 1; i++) {
        let start = path[i];
        let end = path[i + 1];

        let temp = await crawl([start, end, departureDate]);

        if (temp.length === 0) {
            flag = false;
            break;
        }

        resultPerRoute.push(temp);
    }

    // evaluate : 만약 route들 중 하나라도 비어있으면, 무효화

    let tickets = [];

    if (flag) {
        makeTicket(resultPerRoute, [], 0, path, tickets);
    }

    return tickets;
}

function makeTicket(resultPerPath, tempArray, index, path, result) {
    if (tempArray.length === 0) {
        let routes = resultPerPath[index];

        for (let route of routes) {
            tempArray.push(route);
            makeTicket(resultPerPath, tempArray, index + 1, path, result);
            tempArray.pop();
        }

        return;
    }

    if (index == resultPerPath.length) {
        result.push(new Ticket(Object.assign([], tempArray)));
        return;
    }

    let routes = resultPerPath[index];

    for (let route of routes) {
        tempArray.push(route);
        makeTicket(resultPerPath, tempArray, index + 1, path, result);
        tempArray.pop();
    }
}