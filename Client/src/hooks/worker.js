import AI from "./AI/ai";
import actionCalculate from "./Bot/bot";
const ai = new AI(1,1,false,false);

onmessage = function(event) {
    console.log("workera girdim");
    let action;
    //Calculate move for bot
    if(event.data.nickNames[1] === 'Bot'){
        action = actionCalculate(event.data);
    }else{
        action = ai.chooseNextMove(event.data);
    }
    
    postMessage(action);
    console.log("workerdan çıktım");
}