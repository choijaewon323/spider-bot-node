import { FlightPath } from './classes/FlightPath'

const express = require('express');
const app = express();
const port = 3000;

let flightMap;
let queue;

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
});

app.listen(port);

/*
    출발지와 목적지까지의 최소 경유 루트와 경로를 찾음

    Parameters
        departure : string
        destination : string

    Return
        FlightPath 객체의 배열 리턴
*/
function bfs_search(departure, destination) {

}

/*
    전체 flightPath 중 가장 빠른 루트인 최대 3개의
    경유지 리스트 뽑음

    Parameters
        flightPath : FlightPath 객체의 배열
    
    Return
        FlightPath 객체의 배열
*/
function findFastestRoute(flightPath) {

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

}

