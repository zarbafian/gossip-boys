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
var MessageType;
(function (MessageType) {
    MessageType["Push"] = "Push";
    MessageType["Pull"] = "Pull";
    MessageType["UpdatePush"] = "UpdatePush";
    MessageType["UpdatePull"] = "UpdatePull";
})(MessageType || (MessageType = {}));
class Message {
    constructor(id, type, sender) {
        this.id = id;
        this.type = type;
        this.sender = sender;
        this.epidemic = false;
        this.parts = [];
    }
    static new(type, from) {
        let messageId = Message.nextId.toString();
        Message.nextId++;
        let message = new Message(messageId, type, from);
        return message;
    }
}
Message.nextId = 1;
//# sourceMappingURL=bus.js.map