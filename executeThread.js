const {parentPort} = require('worker_threads');
const crawl = require('./crawlingThread.js');

parentPort.on('message', async (present) => {
    let promises = [];

    let path = present[0];  // Array
    let cost = present[1];  // Integer
    let departureDate = present[2];
    let pathLength = path.length;

    for (let i = 0; i < pathLength - 1; i++) {
        let start = path[i];
        let end = path[i + 1];
            
        let pathPromise = new Promise((resolve, reject) => {
            crawl([start, end, departureDate]).then((temp) => {
                resolve(temp);
            });
        })
            
        promises.push(pathPromise);
    }

    let resultPerPath = await Promise.all(promises);

    parentPort.postMessage(resultPerPath);
    parentPort.close();
})