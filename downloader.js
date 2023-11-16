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
    
    let result = [];
    let allPromise = [];

    //console.log("process entered");

    for (let present of paths) {
        let path = present[0];
        let promise = runThread(present, departureDate);
        allPromise.push(promise);
    }

    let promiseResult = await Promise.all(allPromise);

    for (let temp of promiseResult) {
        result.push(...temp);
    }

    return result;
}

function runThread(present, departureDate) {
    return new Promise(async (resolve, reject) => {
        present.push(departureDate);
        
        let resultPerPath = await executeCrawling(present);
        resolve(resultPerPath);
    })
}