const express = require('express');
const app = express();
const port = 3000;

const jsonData = require('./data/crawled_data.json');
const process = require('./downloader.js');

const Queue = require('./classes/Queue.js');
const Task = require('./classes/Task.js');

let flightCost = new Map();
let graph = new Map();

init();

app.use(express.json());

// 5.1.7 항공편 조회 API
/// getFlight(req, res)
/*
    Request Body
    {
        ‘flag’ : 0,
        ‘departure’ : ‘ICN’,
        ‘destination’ : ‘JFK’,
        ‘departureDate’ : ‘2023-10-17’
    }
*/
app.get('/spiderbot/list', async (req, res) => {
    const start = new Date();

    let requestBody = req.body;
    let departure = requestBody['departure'];
    let destination = requestBody['destination'];
    let departureDate = requestBody['departureDate'];
    let flag = requestBody['flag'];

    if (flag == 0) {
        let finded = findFastestRoute(departure, destination);

        let task = makeTask(departure, destination, departureDate, finded);
        let result = await process(task);

        const end = new Date();
        // console.log(end - start);

        res.send(JSON.stringify(result));
    }
    else if (flag == 1) {
        res.send("Not implemented");
    }
});

app.listen(port);

/*
    input
        departure : string
        destination : string

    output
        paths : ex ) [[path1], [path2], [path3]]
*/
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

/*
    input
        departure, destination
    
    output
        pathTimes [[path1, cost1], [path2, cost2], ...]
*/
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

    return pathTimes;
}

/*
    input
        departure, destination, departureDate, paths
    
    output
        Task 객체
*/
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