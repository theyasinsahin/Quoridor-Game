import actionCalculate from "./Bot/bot";

onmessage = function(event) {
    console.log("Worker'a girdi");
    const action = actionCalculate(event.data);
    postMessage(action);
    console.log("workerdan çıktım");
}