import PluginAbstract, {ResponseData} from "./PluginAbstract";
import {EventEmitter} from "events";
import * as uuid from "uuid";

export class PluginContext {
    private event = new EventEmitter();
    private request = new EventEmitter();

    constructor(private plugin: PluginAbstract, public readonly uuid: string, public readonly config: any) {
        plugin.onContext(uuid, (responseData: ResponseData) => {
            const {responseUuid, event} = responseData;
            this.event.emit("*", responseData);
            if (responseUuid) {
                this.request.emit(responseUuid, responseData);
            } else {
                this.event.emit(event, responseData);
            }
        })
    }

    public async getSettings(): Promise<any> {
        return (await this.invoke("getSettings")).payload;
    }

    public setSettings(value: any): void {
        this.emit("setSettings", value)
    }

    public setText(value: string): void {
        this.emit("setText", value)
    }

    public setImage(value: string): void {
        this.emit("setImage", value)
    }

    public setColor(value: string): void {
        this.emit("setColor", value)
    }

    /**
     * Send an asynchronous message to the main process, along with arguments.
     * @param event {string}
     * @param payload {any}
     */
    public emit(event: string, payload?: any): PluginAbstract {
        return this.plugin.emit(event, this.uuid, payload);
    }

    /**
     * Send a message to the main process and expect a result asynchronously.
     * @param event
     * @param ctx
     * @param payload
     * @return Promise<ResponseData>
     */
    public invoke<T = any>(event: string, payload?: any): Promise<ResponseData<T>> {
        return new Promise((resolve) => {
            const requestUuid = uuid.v4();
            this.request.once(requestUuid, resolve);
            this.plugin.send({
                event,
                ctx: this.uuid,
                payload,
                requestUuid
            });
        });
    }

    /**
     * Listens to event, when a new message arrives listener would be called with listener(response).
     * @param event
     * @param listener
     */
    public on(event: string | "*", listener: (response: ResponseData) => void): any {
        return this.event.on(event, listener);
    }

    /**
     * @todo need to implement this method
     */
    public async stop(): Promise<boolean> {
        return (await this.invoke<boolean>("stop")).payload
    }
}
