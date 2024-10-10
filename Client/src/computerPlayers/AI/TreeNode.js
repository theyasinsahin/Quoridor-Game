function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export class TreeNode {
    constructor(move, parent, uctConst){
        this.numWins = 0;
        this.numSims = 0;
        this.children = [];
        this.isTerminal = false;
        this.parent = parent;
        this.move = move;
        this.uctConst = uctConst;
    }


    get isLeaf() {
        return this.children.length === 0;
    }

    get isNew() {
        return this.numSims === 0;
    }

    // References: 
    // Levente Kocsis, Csaba Szepesva ́ri (2006 ) "Bandit based Monte-Carlo Planning"
    // Peter Auer, Cesa-Bianchi, Fischer (2002) "Finite-time Analysis of the Multiarmed Bandit Problem"
    // Do google search for "monte carlo tree search uct"
    get uct() {
        if (this.parent === null || this.parent.numSims === 0) {
            throw "UCT_ERROR"
        }
        if (this.numSims === 0) {
            return Infinity;
        }
        return (this.numWins / this.numSims) + Math.sqrt((this.uctConst * Math.log(this.parent.numSims)) / this.numSims);
    }

    get winRate() {
        return this.numWins / this.numSims;
    }

    get maxUCTChild() {
        let maxUCTIndices;
        let maxUCT = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            const uct = this.children[i].uct;
            if (uct > maxUCT) {
                maxUCT = uct;
                maxUCTIndices = [i];  
            } else if (uct === maxUCT) {
                maxUCTIndices.push(i);
            }
        }
        const maxUCTIndex = randomChoice(maxUCTIndices);
        //const maxUCTIndex = maxUCTIndices[0];
        return this.children[maxUCTIndex];
    }

    get maxWinRateChild(){
        let maxWinRateChildIdx;
        let maxWinRate = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            if(maxWinRate < this.children[i].winRate){
                maxWinRate = this.children[i].winRate;
                maxWinRateChildIdx = i;
            }
        }
        return this.children[maxWinRateChildIdx];
    }

    get maxSimsChild(){
        let maxSimsChildIdx;
        let maxSims = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            if(maxSims < this.children[i].numSims){
                maxSims = this.children[i].numSims;
                maxSimsChildIdx = i;
            }
        }
        return this.children[maxSimsChildIdx];
    }

    addChild(childNode){
        this.children.push(childNode);
    }

    printChildren() {
        for (let i = 0; i < this.children.length; i++) {
            console.log(`children[${i}].move: ${this.children[i].move}`);
        }
    }
}