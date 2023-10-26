class FlightPath {
    path;
    totalCost;

    constructor(path, cost) {
        this.path = path;
        this.cost = cost;
    }

    get path() {
        return this.path;
    }

    get cost() {
        return this.cost;
    }

    set path(path) {
        this.path = path;
    }

    set cost(cost) {
        this.cost = cost;
    }
}

class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    push(data) {
        const newNode = new Node(data);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
          } else {
            this.tail.next = newNode;
            this.tail = newNode;
          }
      
          this.size++;
    }

    pop() {
        if (!this.head) {
            return null;
        }
      
        const removeNode = this.head;
        this.head = this.head.next;
        if (!this.head) {
            this.tail = null;
        }
      
        this.size--;
      
        return removeNode.data;
    }

    isEmpty() {
        return this.size === 0;
    }
}

const express = require('express');
const app = express();
const port = 3000;

const jsonData = require('./crawled_data.json');

let flightCost = new Map();
let graph = new Map();

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
app.get('/spiderbot/list', (req, res) => {
    init();

    let finded = findFastestRoute("ICN", "JFK");
    
    for (let id in finded) {
        let temp = finded[id];

        console.log("path : " + temp[0] + " cost : " + temp[1]);
    }

    /*
    let requestBody = req.body;
    let flag = requestBody.flag;

    if (flag == 0) {    // 항공편 리스트
        let departure = requestBody.departure;
        let destination = requestBody.destination;
        let departureDate = requestBody.departureDate;

        let flightPaths = bfs_search(departure, destination);
    
        let resultList = findFastestRoute(flightPath);

        let task = makeTask(flightPath);

        let result = process(task);
    }
    else if (flag == 1) {   // 취소표 확인 요청
        
    }
    */

    res.send(finded);
});

app.listen(port);

/*
    출발지와 목적지까지의 최소 경유 루트와 경로를 찾음

    Parameters
        departure : string
        destination : string

    Return
        paths 리턴 [[path1], [path2], [path3]]
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
    전체 flightPath 중 가장 빠른 루트인 최대 3개의
    경유지 리스트 뽑음

    Parameters
        departure, destination
    
    Return
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
    flightPath를 task 객체로 변환하는 함수

    Parameters
        flightPath : FlightPath 객체의 배열
    
    Return
        Task 객체
*/
function makeTask(flightPath) {

}

/* 
    flightMap 초기화 함수
*/
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