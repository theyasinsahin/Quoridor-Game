import actionCalculate from "./Bot/bot";
import AI from "./ai";

onmessage = async function(event) {
    console.log("workera girdim");
    let action;
    let nickNameIdx;
    //Calculate move for bot
    if(event.data.playAs === 'player1'){
        nickNameIdx = 1;
    }else{
        nickNameIdx = 0;
    }
    if(event.data.nickNames[nickNameIdx] === 'Bot'){
        action = actionCalculate(event.data);
    }else if(event.data.nickNames[nickNameIdx] === 'AI'){
        try {
            const ai = new AI(20000, 1.5, true);
            action = ai.chooseNextMove(event.data);
        } catch (error) {
            console.error("Error in AI calculation:", error);
        }
    }
    console.log("worker.js action: ",action)
    postMessage(action);
    console.log("workerdan çıktım");
}