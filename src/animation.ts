class MessageAnimation {
    node: SVGGraphicsElement;
    startValue: Point;
    endValue: Point;
    duration: number;
    started: boolean;
    done: boolean;
    startTime: number;

    constructor(node: SVGGraphicsElement, startValue: Point, endValue: Point, duration: number) {
        this.node = node;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.started = false;
        this.done = false;
    }

    start(onCompletion: () => void) {
        if (this.started || this.done) {
            return;
        }
        this.started = true;
        const animateStep = (timestamp: number) => {
            if (this.done) {
                this.clear();
                return;
            }
            if (this.startTime == null) {
                this.startTime = timestamp;
            }
            const progress = (timestamp - this.startTime) / this.duration;
            if (progress < 1) {
                const currentX: number = (this.endValue.x - this.startValue.x) * progress + this.startValue.x;
                const currentY: number = (this.endValue.y - this.startValue.y) * progress + this.startValue.y;
                this.node.setAttributeNS(null, "cx", currentX.toString());
                this.node.setAttributeNS(null, "cy", currentY.toString());
                window.requestAnimationFrame(animateStep);
            } else {
                this.node.setAttributeNS(null, "cx", this.endValue.x.toString());
                this.node.setAttributeNS(null, "cy", this.endValue.y.toString());
                onCompletion();
                this.done = true;
                this.clear();
            }
        }
        window.requestAnimationFrame(animateStep);
    }

    clear() {
        let svgElement = document.getElementById(Html.svg);
        let msgElement = document.getElementById(this.node.id);
        if(msgElement != null) {
            svgElement.removeChild(msgElement);
        }
    }

    cancel() {
        this.done = true;
    }
}