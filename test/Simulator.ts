import {MessagePort, ResponseData} from "../src/StreamBoardSDK";
import {EventEmitter} from "events";

export default class Simulator implements MessagePort {
    private event = new EventEmitter();

    public on(event: "message", listener: (value: any) => void): this {
        this.event.on("message", listener);
        return this;
    }

    public postMessage(value: any): this {
        this.event.emit("post", value);
        return this;
    }

    public post(data: ResponseData): this {
        this.event.emit("message", data);
        return this;
    }
}
