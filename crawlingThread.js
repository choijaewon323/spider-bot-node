const { parentPort } = require('worker_threads')

parentPort.on('message', (value) => {
    /*
        URL에 따른 분기문 수행
    */
    parentPort.postMessage(value[0] + value[1]);
    parentPort.close();
})