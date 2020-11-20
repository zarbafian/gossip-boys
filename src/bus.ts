interface MessageBusSubscriber {
    id: number;
    onMessage(message: Message): void;
}

class MessageBus {
    private static instance: MessageBus = null;

    private subscribers: { [topic: string]: MessageBusSubscriber[] };

    private constructor() {
        console.log("MessageBus.constructor");
        this.subscribers = {};
    }

    static getInstance(): MessageBus {
        if(MessageBus.instance == null) {
            MessageBus.instance = new MessageBus();
        }

        return MessageBus.instance;
    }

    subscribe(subscriber: MessageBusSubscriber, topic: string): boolean {
        if(!this.subscribers.hasOwnProperty(topic)) {
            this.subscribers[topic] = [];
        }
        // check if not already subscribed
        for(let s of this.subscribers[topic]) {
            if(subscriber.id == s.id) {
                // already subscribed
                //console.log(`subscriber ${subscriber.id} has already subscribed`);
                return false;
            }
        }
        // subscribe
        this.subscribers[topic].push(subscriber);
        console.log(`${subscriber.id} scubscribed to ${topic}`);
        return true;
    }

    notify(message: Message, topic: string) {
        if(!this.subscribers.hasOwnProperty(topic)) {
            this.subscribers[topic] = [];
        }
        for(let s of this.subscribers[topic]) {
            s.onMessage(message);
        }
    }

    unsubscribe(subscriber: MessageBusSubscriber, topic: string) {
        if(this.subscribers.hasOwnProperty(topic)) {
            let index = -1;
            for (let i = 0; i < this.subscribers[topic].length; i++) {
                if(subscriber.id == this.subscribers[topic][i].id) {
                    index = i;
                    break;
                }
            }
            if(index != -1) {
                this.subscribers[topic].splice(index, 1);
                //console.log(`${subscriber.id} unscubscribed from ${topic}`);
            }
        }
    }
}

class Message {
    id: string;
    value: string;
    sender: number;
    static nextId: number = 1;
    private constructor(id: string, value: string, sender: number) {
        this.id = id;
        this.value = value;
        this.sender = sender;
    }
    static new(data: string, from: number) {
        let messageId = Message.nextId.toString();
        Message.nextId++;
        let message = new Message(messageId, data, from);
        return message;
    }
}