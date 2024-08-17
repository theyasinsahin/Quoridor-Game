import actionCalculate from "./Bot/bot";

onmessage = function(event) {
    console.log("workera girdim");
    let action;
    //Calculate move for bot
    if(event.data.nickNames[1] === 'Bot'){
        action = actionCalculate(event.data);
    }
    
    postMessage(action);
    console.log("workerdan çıktım");
}