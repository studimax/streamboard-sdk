import {parentPort} from "worker_threads";
import {EventEmitter} from "events";
import PluginContext from "./PluginContext";
import {EventName} from "./EventName";

export default abstract class PluginAbstract {
    private event = new EventEmitter();
    private eventAction = new EventEmitter();

    protected constructor() {
        this.init().then(() => {
            this.emit("ready");
            parentPort?.on("message", ({event, data}) => {
                this.event.emit("*", data);
                this.event.emit(event, data);
                if (event === "action") {
                    this.eventAction.emit(data.action, new PluginContext(this, data.ctx), data.event, data.data);
                }
            });
        });
    }

    public emit(event: string, data?: any): this {
        parentPort?.postMessage({
            event,
            data
        });
        return this;
    }

    public on(event: string | symbol | "*", listener: (...args: any[]) => void): any {
        return this.event.on(event, listener);
    }

    public onAction(action: string, listener: (ctx: PluginContext, event: EventName, data: any) => void): any {
        return this.eventAction.on(action, listener);
    }

    protected async init(): Promise<void> {
        return;
    }
}
