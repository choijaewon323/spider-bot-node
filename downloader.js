
module.exports = { process };

const {Worker} = require('worker_threads');

function process(task) {
    let taskSize = task.length;

    for (let pathIndex = 0; pathIndex < taskSize; pathIndex++) {
        let path = task[pathIndex].path;
        let destination = task[pathIndex].destination;
        let departure = task[pathIndex].departure;
        let departureDate = task[pathIndex].departureDate;

        if (path.length == 2) { // 직항
            
        }
        else {  // 경유 포함

        }
    }
}

async function run(flight) {
    const result = await runThread(flight);
    
    return result;
}

function runThread(flight) {
    return new Promise((resolve, reject) => {
        const worker = new Worker("./crawlingThread.js");

        worker.on('message', (value) => {
            resolve(value);
        })
        worker.on('error', (error) => {
            reject(error);
        })
        worker.on('exit', (code) => {
            if (code != 0) {
                reject(new Error(`exit code ${code}`));
            }
        })

        worker.postMessage(flight);
    })
}

function crawlingInfo(url, departure, destination, date, people) {

}