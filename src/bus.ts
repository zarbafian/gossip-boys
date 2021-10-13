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

enum MessageType {
    Push = 'Push',
    Pull = 'Pull',
    UpdatePush = 'UpdatePush',
    UpdatePull = 'UpdatePull',
}

class Message {
    static nextId: number = 1;
    
    id: string;
    type: MessageType;
    sender: number;
    epidemic: boolean;
    parts: PartIndex[];
    
    gossipers: number[];
    hops: number;
    payload: any;

    private constructor(id: string, type: MessageType, sender: number) {
        this.id = id;
        this.type = type;
        this.sender = sender;
        this.epidemic = false;
        this.parts = [];
        //this.gossipers = [];
        //this.gossipers.push(gossiper);
        //this.epidemic = broadcast;
        //this.hops = 1;
    }

    /*
    clone(): Message {
        let copy = new Message(this.id, this.type, this.sender, this.sender, this.epidemic);
        copy.gossipers = this.gossipers.slice(0);
        copy.hops = this.hops;
        return copy;
    }
    */

    static new(type: MessageType, from: number) {
        let messageId = Message.nextId.toString();
        Message.nextId++;
        let message = new Message(messageId, type, from);
        return message;
    }
}