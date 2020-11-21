class MessageBus {
    constructor() {
        console.log("MessageBus.constructor");
        this.subscribers = {};
    }
    static getInstance() {
        if (MessageBus.instance == null) {
            MessageBus.instance = new MessageBus();
        }
        return MessageBus.instance;
    }
    subscribe(subscriber, topic) {
        if (!this.subscribers.hasOwnProperty(topic)) {
            this.subscribers[topic] = [];
        }
        for (let s of this.subscribers[topic]) {
            if (subscriber.id == s.id) {
                return false;
            }
        }
        this.subscribers[topic].push(subscriber);
        return true;
    }
    notify(message, topic) {
        if (!this.subscribers.hasOwnProperty(topic)) {
            this.subscribers[topic] = [];
        }
        for (let s of this.subscribers[topic]) {
            s.onMessage(message);
        }
    }
    unsubscribe(subscriber, topic) {
        if (this.subscribers.hasOwnProperty(topic)) {
            let index = -1;
            for (let i = 0; i < this.subscribers[topic].length; i++) {
                if (subscriber.id == this.subscribers[topic][i].id) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                this.subscribers[topic].splice(index, 1);
            }
        }
    }
}
MessageBus.instance = null;
class Message {
    constructor(id, value, sender, gossiper, broadcast) {
        this.id = id;
        this.value = value;
        this.sender = sender;
        this.gossipers = [];
        this.gossipers.push(gossiper);
        this.epidemic = broadcast;
        this.hops = 1;
    }
    clone() {
        let copy = new Message(this.id, this.value, this.sender, this.sender, this.epidemic);
        copy.gossipers = this.gossipers.slice(0);
        copy.hops = this.hops;
        return copy;
    }
    static new(data, from, broadcast) {
        let messageId = Message.nextId.toString();
        Message.nextId++;
        let message = new Message(messageId, data, from, from, broadcast);
        return message;
    }
}
Message.nextId = 1;
//# sourceMappingURL=bus.js.map