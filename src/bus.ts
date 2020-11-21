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
        //console.log(`${subscriber.id} scubscribed to ${topic}`);
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
    static nextId: number = 1;
    
    id: string;
    value: string;
    sender: number;
    gossipers: number[];
    
    epidemic: boolean;
    hops: number;

    private constructor(id: string, value: string, sender: number, gossiper: number, broadcast: boolean) {
        this.id = id;
        this.value = value;
        this.sender = sender;
        this.gossipers = [];
        this.gossipers.push(gossiper);
        this.epidemic = broadcast;
        this.hops = 1;
    }

    clone(): Message {
        let copy = new Message(this.id, this.value, this.sender, this.sender, this.epidemic);
        copy.gossipers = this.gossipers.slice(0);
        copy.hops = this.hops;
        return copy;
    }

    static new(data: string, from: number, broadcast: boolean) {
        let messageId = Message.nextId.toString();
        Message.nextId++;
        let message = new Message(messageId, data, from, from, broadcast);
        return message;
    }
}