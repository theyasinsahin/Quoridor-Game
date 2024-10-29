// Priority Queue class
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority); // Sort by priority (fScore)
    }

    dequeue() {
        return this.elements.shift().element; // Return element with the lowest priority
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

export default PriorityQueue;