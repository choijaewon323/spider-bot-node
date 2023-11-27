const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

const jsonData = require('./data/crawled_data.json');
const process = require('./downloader.js');

const Queue = require('./classes/Queue.js');
const Task = require('./classes/Task.js');

const executeCrawling = require('./executeThread.js');

let flightCost = new Map();
let graph = new Map();

init();

app.use(express.json());
app.use(cors());

app.get('/spiderbot/list', async (req, res) => {
    let {departure, destination, departureDate, flag} = req.query;

    let year = departureDate.substring(0, 4);
    let month = departureDate.substring(4, 6);
    let day = departureDate.substring(6);

    let datedDepartureDate = new Date(Date.UTC(
        Number(year), Number(month) - 1, Number(day) 
    ));

    if (flag == 0) {
        let finded = findFastestRoute(departure, destination);

        let task = makeTask(departure, destination, datedDepartureDate, finded);
        let result = await process(task);

        res.send(JSON.stringify(result));
    }
    else if (flag == 1) {
        res.send("Not implemented");
    }
});

app.post('/spiderbot/monitor', async (req, res) => {
    let promises = [];
    let flightNumbers = [];
    let cache = new Map();

    for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            let item = req.body[key];
            
            let departure = item.departure;
            let destination = item.destination;
            let departureDate = new Date(item.departureDate);
            let departureDateUTC = new Date(Date.UTC(departureDate.getUTCFullYear(), departureDate.getUTCMonth(), 
                                            departureDate.getUTCDate(), departureDate.getUTCHours(),
                                            departureDate.getUTCMinutes(), departureDate.getUTCSeconds()) 
                                        );
            let flightNumber = item.flightNumber;
            flightNumbers.push(flightNumber);
            
            let present = [[departure, destination], 0];
            let promise = runThread(present, departureDateUTC, 0, cache);
            promises.push(promise);
        }
    }

    let results = await Promise.all(promises);

    let match = isAllCorrect(flightNumbers, results);

    if (match) {
        res.send(true);
    }
    else {
        res.send(false);
    }
})

function isAllCorrect(flightNumbers, results) {
    let resultLength = results.length;

    if (flightNumbers.length != resultLength) {
        return false;
    }

    if (resultLength == 0) {
        return false;
    }

    for (let i = 0; i < resultLength; i++) {
        let flightNumber = flightNumbers[i];

        for (let ticket of results[i]) {
            let stopover = ticket.stopover;
            let route = stopover[0];
            
            if (route.flightNumber == flightNumber) {
                return true;
            }
        }
    }

    return false;
}

function runThread(present, departureDate, flag, cache) {
    return new Promise(async (resolve, reject) => {
        present.push(departureDate);
        
        let resultPerPath = await executeCrawling(present, flag, cache);
        resolve(resultPerPath);
    })
}

app.listen(port);

function printFinded(finded) {
    for (let temp of finded) {
        console.log("path : " + temp[0] + " / cost : " + temp[1]); 
    }
}

function bfs_search(departure, destination) {
    let visited = [];
    
    let queue = new Queue();
    queue.push([departure, [departure]]);
    let paths = [];
    let minLength = 100000000;
    let exceededLimit = false;

    while (!queue.isEmpty()) {
        let front = queue.pop();
        let current = front[0];
        let path = front[1];

        if (current == destination) {
            if (minLength == 100000000) {
                minLength = path.length;
            }

            if (path.length == minLength) {
                paths.push(path);
            }
        }

        if (!visited.includes(current)) {
            visited.push(current);
            
            let tempGraph = graph.get(current);
            
            if (tempGraph === undefined) {
                continue;
            }

            for (let neighbor of graph.get(current)) {
                let newPath = Object.assign([], path);
                
                newPath.push(neighbor);
                queue.push([neighbor, newPath]);

                if (newPath.length > minLength) {
                    continue;
                }
            }

        }
    }

    return paths;
}

function findFastestRoute(departure, destination) {
    let paths = bfs_search(departure, destination);

    let pathTimes = [];

    for (let path of paths) {
        let totalMinutes = 0;

        for (let i = 0; i < path.length - 1; i++) {
            let departure = path[i];
            let destination = path[i + 1];
            let key = departure + " " + destination;

            if (flightCost.has(key)) {
                let cost = flightCost.get(key);
                totalMinutes += cost;
            }
        }

        pathTimes.push([path, totalMinutes]);
    }

    pathTimes.sort(compare);

    return pathTimes;
}

function compare(first, second) {
    return first[1] - second[1];
}

function makeTask(departure, destination, departureDate, paths) {
    return new Task(departure, destination, departureDate, paths);
}

function init() {
    for (let id in jsonData) {
        let entry = jsonData[id];
        let departure = entry["departure"];
        let destination = entry["destination"];

        let key = departure + " " + destination;

        let flight_time = entry["flight_time"];
        let minute = timeToMinutes(flight_time);

        flightCost.set(key, minute);

        if (!graph.has(departure)) {
            graph.set(departure, new Array());
        }
        let dep = graph.get(departure);
        dep.push(destination);
    }
}

function timeToMinutes(time) {
    let hours = 0;
    let minutes = 0;

    let arr = time.split(" ");

    hours = Number(arr[0]);

    if (arr.length >= 3) {
        minutes = Number(arr[3]);

        return hours * 60 + minutes;
    } 

    return hours * 60;
}