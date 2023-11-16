const executeCrawling = require('./executeThread.js');

const Route = require("./classes/Route.js");
const Ticket = require('./classes/Ticket.js');
const TicketList = require('./classes/TicketList.js');

/*
    [input]
    class Task {
        departure;
        destination;
        departureDate;
        paths;
    }
*/
/*
    [output]
    class TicketList {
        tickets = [ticket1, ticket2, ....]
    }

    class Ticket {
        path = ['ICN', 'LAS', 'JFK']
        routes = [route1, route2]
    }

    class Route {
        airline;
        departure;
        destination;
        departureTime;
        arrivedTime;
        timeTaken;
        price;
    }
*/
module.exports = async function process(task) {
    let departure = task.departure;
    let destination = task.destination;
    let departureDate = task.departureDate;
    let paths = task.paths;

    //console.log("process entered");

    for (let present of paths) {
        let path = present[0];
        let result = await runThread(present, departureDate);

        if (result.length != 0) {
            return result;
        }
    }

    return [];
}

function runThread(present, departureDate) {
    return new Promise(async (resolve, reject) => {
        present.push(departureDate);
        
        let resultPerPath = await executeCrawling(present);
        resolve(resultPerPath);
    })
}