const SVG_NS = "http://www.w3.org/2000/svg";
function getAnimationDuration(distance) {
    let numberOfTimeUnits = distance / 300;
    let durationPerTimeUnit = 20 / simulation.speed;
    return Math.round(durationPerTimeUnit * numberOfTimeUnits * 1000);
}
function toLinkId(id1, id2) {
    return id1 + "-" + id2;
}
class SvgManager {
    constructor(id, width, height) {
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
        svg.setAttribute("width", this.width.toString());
        svg.setAttribute("height", this.height.toString());
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.point = svg.createSVGPoint();
        let leftClickHandler = (event) => {
            if (event.button == MouseButton.Left) {
                let pid = this.parseProcessId(event.target.id);
                simulation.toggleProcess(pid);
            }
        };
        let rightClickHandler = (event) => {
            event.preventDefault();
            console.log(`clicked: id=${event.target}`);
        };
        svg.addEventListener('mouseup', leftClickHandler);
        svg.addEventListener('contextmenu', rightClickHandler);
        document.getElementById(Html.display).appendChild(svg);
    }
    parseProcessId(htmlId) {
        return parseInt(htmlId.substring(htmlId.lastIndexOf('_') + 1));
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
    createProcess(peer) {
        let center = this.cartesianToScreen(peer.position);
        let group = document.createElementNS(SVG_NS, "g");
        group.setAttributeNS(null, "id", "g_" + peer.id);
        group.setAttributeNS(null, "text-anchor", "middle");
        group.setAttributeNS(null, "transform", "translate(" + center.x + "," + center.y + ")");
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttributeNS(null, "id", "circle_" + peer.id);
        circle.setAttributeNS(null, "cx", "0");
        circle.setAttributeNS(null, "cy", "0");
        circle.setAttributeNS(null, "r", "3");
        circle.setAttributeNS(null, "fill", Color.ProcessOffline);
        circle.setAttributeNS(null, "opacity", "1");
        circle.setAttributeNS(null, "stroke", "black");
        circle.setAttributeNS(null, "stroke-opacity", "0.1");
        circle.setAttributeNS(null, "class", "draggable peer");
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
        line.setAttributeNS(null, "stroke-opacity", "0.2");
        line.setAttributeNS(null, "class", "link");
        line.setAttributeNS(null, "opacity", "0.5");
        let svgElement = document.getElementById(this.id);
        svgElement.insertBefore(line, svgElement.firstChild);
    }
    removeLink(link) {
        let svgElement = document.getElementById(this.id);
        let linkElement = document.getElementById(link.toId());
        svgElement.removeChild(linkElement);
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
    setSourceProcess(pid) {
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttributeNS(null, "id", "source_" + pid);
        circle.setAttributeNS(null, "cx", "0");
        circle.setAttributeNS(null, "cy", "0");
        circle.setAttributeNS(null, "r", "10");
        circle.setAttributeNS(null, "fill", Color.ProcessInfected);
        circle.setAttributeNS(null, "opacity", "0.3");
        document.getElementById("g_" + pid).appendChild(circle);
    }
    clearSourceProcess(pid) {
        let group = document.getElementById("g_" + pid);
        let source = document.getElementById("source_" + pid);
        group.removeChild(source);
    }
    send(process, targets, message) {
        for (let target of targets) {
            let msgId = "msgFROM" + process.id + "TO" + target.id;
            let svgElement = this.newMessage(msgId, process.position, Color.Message);
            let senderPositionScreen = this.cartesianToScreen(process.position);
            let targetPositionScreen = this.cartesianToScreen(target.position);
            let d = distance(process.position, target.position);
            let t = getAnimationDuration(d);
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
            case PeerStatus.Online:
                color = Color.ProcessOnline;
                break;
            case PeerStatus.Offline:
                color = Color.ProcessOffline;
                break;
            case PeerStatus.Infected:
                color = Color.ProcessInfected;
                break;
            case PeerStatus.Removed:
                color = Color.ProcessRemoved;
                break;
            default:
                console.log(`unknown status ${status}`);
        }
        document.getElementById("circle_" + pid).setAttributeNS(null, "fill", color);
    }
}
//# sourceMappingURL=svg.js.map