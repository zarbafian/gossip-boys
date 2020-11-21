const SVG_NS = "http://www.w3.org/2000/svg";
function toLinkId(id1, id2) {
    return id1 + "-" + id2;
}
class SvgManager {
    constructor(id, width, height) {
        this.selectedElement = null;
        this.offset = null;
        this.addProcessOnMouseUp = false;
        this.move = null;
        this.fromElement = null;
        this.toElement = null;
        this.id = id;
        this.width = width;
        this.height = height;
        this.zero = new Point(Math.round(this.width / 2), Math.round(this.height / 2));
    }
    init() {
        let svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("id", this.id);
        svg.setAttribute("style", "border: 1px solid #444444");
        svg.setAttribute("width", this.width.toString());
        svg.setAttribute("height", this.height.toString());
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.point = svg.createSVGPoint();
        let self = this;
        let startDrag = (event) => {
            if (event.which == MouseButton.Left) {
                if (event.target.classList.contains("draggable")) {
                    self.selectedElement = event.target.parentNode;
                    self.offset = this.getMousePosition(event);
                    let transformRaw = self.selectedElement.getAttributeNS(null, "transform");
                    let transform = self.parseTransform(transformRaw);
                    self.offset.x -= transform.x;
                    self.offset.y -= transform.y;
                }
            }
        };
        let endDrag = (event) => {
            if (event.which == MouseButton.Left) {
                if (event.altKey || self.fromElement != null) {
                }
                else {
                    if (self.selectedElement != null) {
                    }
                    else if (self.addProcessOnMouseUp) {
                    }
                    self.selectedElement = null;
                    self.offset = null;
                    self.move = null;
                }
            }
        };
        svg.addEventListener('mousedown', startDrag);
        svg.addEventListener('mouseup', endDrag);
        document.body.appendChild(svg);
    }
    getMousePosition(event) {
        var CTM = document.getElementById(this.id).getScreenCTM();
        return new Point((event.clientX - CTM.e) / CTM.a, (event.clientY - CTM.f) / CTM.d);
    }
    parseTransform(transform) {
        let begin = transform.indexOf("(") + 1;
        let middle = transform.indexOf(",");
        let end = transform.indexOf(")");
        let x = parseFloat(transform.substring(begin, middle));
        let y = parseFloat(transform.substring(middle + 1, end));
        return new Point(x, y);
    }
    screenToCartesian(point) {
        let raw = new Point(point.x - this.zero.x, this.zero.y - point.y);
        return new Point(raw.x, raw.y);
    }
    cartesianToScreen(point) {
        return new Point(point.x + this.zero.x, -point.y + this.zero.y);
    }
    createProcess(process) {
        let center = this.cartesianToScreen(process.position);
        let group = document.createElementNS(SVG_NS, "g");
        group.setAttributeNS(null, "id", "g" + process.id);
        group.setAttributeNS(null, "text-anchor", "middle");
        group.setAttributeNS(null, "transform", "translate(" + center.x + "," + center.y + ")");
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttributeNS(null, "id", process.id + "circle");
        circle.setAttributeNS(null, "cx", "0");
        circle.setAttributeNS(null, "cy", "0");
        circle.setAttributeNS(null, "r", "3");
        circle.setAttributeNS(null, "fill", Color.ProcessOffline);
        circle.setAttributeNS(null, "stroke", "black");
        circle.setAttributeNS(null, "opacity", "1");
        circle.setAttributeNS(null, "class", "draggable process");
        group.appendChild(circle);
        document.getElementById(this.id).appendChild(group);
    }
    createLink(id, start, end) {
        let startScreen = this.cartesianToScreen(start);
        let endScreen = this.cartesianToScreen(end);
        let line = document.createElementNS(SVG_NS, "line");
        line.setAttributeNS(null, "id", id);
        line.setAttributeNS(null, "x1", startScreen.x.toString());
        line.setAttributeNS(null, "y1", startScreen.y.toString());
        line.setAttributeNS(null, "x2", endScreen.x.toString());
        line.setAttributeNS(null, "y2", endScreen.y.toString());
        line.setAttributeNS(null, "stroke", Color.LinkDefault);
        line.setAttributeNS(null, "stroke-width", "1px");
        line.setAttributeNS(null, "class", "link");
        line.setAttributeNS(null, "opacity", "0.5");
        let svgElement = document.getElementById(this.id);
        svgElement.insertBefore(line, svgElement.firstChild);
    }
    newMessage(id, position, color) {
        let center = this.cartesianToScreen(position);
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttributeNS(null, "id", id);
        circle.setAttributeNS(null, "cx", center.x.toString());
        circle.setAttributeNS(null, "cy", center.y.toString());
        circle.setAttributeNS(null, "r", "4");
        circle.setAttributeNS(null, "fill", color);
        circle.setAttributeNS(null, "stroke", "none");
        circle.setAttributeNS(null, "class", "message");
        circle.setAttributeNS(null, "opacity", "0.7");
        document.getElementById(this.id).appendChild(circle);
        return circle;
    }
    send(process, targets, message) {
        for (let target of targets) {
            let msgId = "msgFROM" + process.id + "TO" + target.id;
            let svgElement = this.newMessage(msgId, process.position, Color.Message);
            let senderPositionScreen = this.cartesianToScreen(process.position);
            let targetPositionScreen = this.cartesianToScreen(target.position);
            let d = distance(process.position, target.position);
            let t = Math.round(d * animationSpeed);
            let animation = new MessageAnimation(svgElement, senderPositionScreen, targetPositionScreen, t);
            const onCompletion = () => {
                MessageBus.getInstance().notify(message, target.id.toString());
            };
            animation.start(onCompletion);
        }
    }
    setProcessStatus(pid, status) {
        let color;
        switch (status) {
            case ProcessStatus.Starting:
                color = Color.ProcessStarting;
                break;
            case ProcessStatus.Online:
                color = Color.ProcessOnline;
                break;
            case ProcessStatus.Source:
                color = Color.ProcessSource;
                break;
            case ProcessStatus.Contaminated:
                color = Color.ProcessContaminated;
                break;
            case ProcessStatus.Offline:
            default:
                color = Color.ProcessOffline;
                break;
        }
        document.getElementById(pid + "circle").setAttributeNS(null, "fill", color);
    }
}
//# sourceMappingURL=svg.js.map