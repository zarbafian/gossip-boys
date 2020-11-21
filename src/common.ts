const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

namespace Html {
    export const svg = "svg";
    export const cmd = "cmd";
    export const tmpl = "tmpl";
}

enum MouseButton {
    Left = 1,
    Middle = 2,
    Right = 3,
}

enum Color {
    ProcessOffline = "#666666",
    ProcessStarting = "#dd9966",
    ProcessOnline = "#22ff22",
    ProcessSource = "#ff2222",
    ProcessContaminated = "#2222ff",
    Message = "#4444ff",
    LinkDefault = "#000000",
}

enum Key {
    Tab = 9,
    Enter = 13,
    Escape = 27,
    Space = 32,
    Up = 38,
    Down = 40,
}

enum Cmd {
    Test = "test",
}

class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getRandomCombination(n: number, k: number) {
    let startIndex = 0;
    let delta = Math.round(n / k) * 2;
    let selectedIndices: number[] = [];
    while(selectedIndices.length < k) {
        let nextIndex = startIndex + getRandomInt(delta);
        if (nextIndex >= n) {
            nextIndex -=n;
        }
        startIndex = nextIndex + 1;
        if (startIndex >= n) {
            startIndex -=n;
        }
        if(selectedIndices.includes(nextIndex)) {
            continue;
        }
        else {
            selectedIndices.push(nextIndex);
        }
    }
    return selectedIndices;
}