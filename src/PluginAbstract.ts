import {parentPort} from "worker_threads";
import {EventEmitter} from "events";
import * as uuid from "uuid";
import {PluginContext} from "./PluginContext";

export interface RequestData<T = any> {
    event: string;
    ctx?: string;
    payload: T;
    requestUuid?: string;
}

export interface ResponseData<T = any> {
    event: string;
    ctx?: string;
    payload: T;
    responseUuid?: string;
}

export default abstract class PluginAbstract {
    private event = new EventEmitter();
    private request = new EventEmitter();
    private contextEvent = new EventEmitter();

    private contexts: Map<string, PluginContext> = new Map<string, PluginContext>()

    protected constructor() {
        this.init().then(() => {
            parentPort?.on("message", (responseData: ResponseData) => {
                const {responseUuid, event, ctx, payload} = responseData;
                this.event.emit("*", responseData);

                if (ctx && uuid.validate(ctx)) {
                    if (!this.contexts.has(ctx)) {
                        const context = new PluginContext(this, ctx, payload);
                        this.contexts.set(ctx, context);
                        this.event.emit("connected", context);
                    }
                    this.contextEvent.emit(ctx, responseData);
                } else {
                    if (responseUuid) {
                        this.request.emit(responseUuid, responseData);
                    } else {
                        this.event.emit(event, responseData);
                    }
                }

            });
        });
    }

    public static send(requestData: RequestData): void {
        parentPort?.postMessage(requestData);
    }

    /**
     * Send an asynchronous message to the main process, along with arguments.
     * @param event {string}
     * @param ctx {string}
     * @param payload {any}
     */
    public emit(event: string, ctx?: string, payload?: any): this {
        PluginAbstract.send({
            event,
            ctx,
            payload
        });
        return this;
    }

    /**
     * Send a message to the main process and expect a result asynchronously.
     * @param event
     * @param ctx
     * @param payload
     * @return Promise<ResponseData>
     */
    public invoke<T = any>(event: string, ctx?: string, payload?: any): Promise<ResponseData<T>> {
        return new Promise((resolve) => {
            const requestUuid = uuid.v4();
            this.request.once(requestUuid, resolve);
            PluginAbstract.send({
                event,
                ctx,
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
    public on(event: "connected", listener: (context: PluginContext) => void): any;
    public on(event: string | "*", listener: (context: ResponseData) => void): any;
    public on(event: string, listener: (...args: any) => void): any {
        return this.event.on(event, listener);
    }

    public onContext(ctx: string, listener: (responseData: ResponseData) => void): any {
        return this.contextEvent.on(ctx, listener);
    }

    public getAllContexts(): PluginContext[] {
        return Array.from(this.contexts.values());
    }

    public stop() {
        this.contexts.forEach(c => c.stop());
    }

    protected async init(): Promise<void> {
        return;
    }
}
