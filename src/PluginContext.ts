import * as uuid from "uuid";
import StreamBoardSDK, {ResponseData} from "./StreamBoardSDK";
import {EventEmitter} from "events";

export class PluginContext {
    public readonly cache: { [key: string]: any } = {};
    private event = new EventEmitter();
    private request = new EventEmitter();

    constructor(private plugin: StreamBoardSDK, public readonly uuid: string, public readonly action: string, public readonly config: any) {
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

    /**
     * Send a request to set the icon's text
     * @param value
     */
    public setText(value: string): void {
        this.emit("setText", value)
    }

    /**
     * Send a request to set the icon's image
     * @param value
     */
    public setImage(value: string): void {
        this.emit("setImage", value)
    }

    /**
     * Send a request to set the icon's color
     * @param value
     */
    public setColor(value: string): void {
        this.emit("setColor", value)
    }

    /**
     * Send an audio play request to the app
     * @param path
     */
    public playSound(path: string): void {
        this.emit("playSound", {
            file: path
        })
    }

    /**
     * Send an asynchronous message to the main process, along with arguments.
     * @param event {string}
     * @param payload {any}
     */
    public emit(event: string, payload?: any): StreamBoardSDK {
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
    public on(event: string | "*" | "click", listener: (response: ResponseData) => void): any {
        return this.event.on(event, listener);
    }

    /**
     * Listens to click event, when a event arrives listener would be called with listener(response).
     * @param listener
     */
    public onClick(listener: (response: ResponseData) => void): any {
        return this.on("click", listener)
    }

    /**
     * @todo need to implement this method
     */
    public async stop(): Promise<boolean> {
        return (await this.invoke<boolean>("stop")).payload
    }
}
