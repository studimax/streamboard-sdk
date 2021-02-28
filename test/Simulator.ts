import {MessagePort, ResponseData} from "../src/PluginAbstract";
import {EventEmitter} from "events";

export default class Simulator implements MessagePort {
    private event = new EventEmitter();

    on(event: "message", listener: (value: any) => void) {
        return this.event.on("message", listener);
    }

    postMessage(value: any): void {
        this.event.emit("post", value);
    }

    post(data: ResponseData) {
        this.event.emit("message", data);
    }
}
