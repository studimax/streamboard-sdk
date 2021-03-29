import * as uuid from 'uuid';
import {ipcRenderer, remote} from 'electron';
import {EventEmitter} from 'events';
import {PluginContext} from './PluginContext';

export interface RequestData<T = any> {
  event: string;
  ctx?: string;
  payload?: T;
  requestUuid?: string;
}

export interface ResponseData<T = any> {
  event: string;
  ctx?: string;
  payload: T;
  responseUuid?: string;
}

export default class StreamBoardSDK {
  private readonly event = new EventEmitter();
  private readonly request = new EventEmitter();
  private readonly contextEvent = new EventEmitter();
  private readonly contexts: Map<string, PluginContext> = new Map<
    string,
    PluginContext
  >();
  private readonly identifier =
    new URL(location.toString()).searchParams.get('identifier') ?? '';

  constructor() {
    if (!this.identifier) remote.getCurrentWindow().close();
    ipcRenderer?.on(this.identifier, (e, responseData: ResponseData) => {
      const {responseUuid, event, ctx, payload} = responseData;
      this.event.emit('*', responseData);

      if (ctx && uuid.validate(ctx)) {
        if (this.contexts.has(ctx)) this.contextEvent.emit(ctx, responseData);
        else if (event === 'connected') {
          const {action, config} = payload;
          const context = new PluginContext(this, ctx, action, config);
          this.contexts.set(ctx, context);
          this.event.emit('connected', context);
        }
      } else {
        if (responseUuid) {
          this.request.emit(responseUuid, responseData);
        } else {
          this.event.emit(event, responseData);
        }
      }
    });
  }

  /**
   * Send to the main process that the plugin is ready
   */
  public async ready(): Promise<boolean> {
    return (await this.invoke<boolean>('ready')).payload;
  }

  /**
   * Send an asynchronous message to the main process, along with arguments.
   * @param event {string}
   * @param ctx {string}
   * @param payload {any}
   */
  public emit(event: string, ctx?: string, payload?: any): this {
    this.send({
      event,
      ctx,
      payload,
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
  public invoke<T = any>(
    event: string,
    ctx?: string,
    payload?: any
  ): Promise<ResponseData<T>> {
    return new Promise(resolve => {
      const requestUuid = uuid.v4();
      this.request.once(requestUuid, resolve);
      this.send({
        event,
        ctx,
        payload,
        requestUuid,
      });
    });
  }

  /**
   * Listens to event, when a new message arrives listener would be called with listener(response).
   * @param event
   * @param listener
   */
  public on(
    event: 'connected',
    listener: (context: PluginContext) => void
  ): EventEmitter;

  public on(
    event: string | '*',
    listener: (context: ResponseData) => void
  ): EventEmitter;

  public on(event: string, listener: (...args: any) => void): EventEmitter {
    return this.event.on(event, listener);
  }

  public onConnection(
    listener: (context: PluginContext) => void
  ): EventEmitter {
    return this.on('connected', listener);
  }

  public onContext(
    ctx: string,
    listener: (responseData: ResponseData) => void
  ): any {
    return this.contextEvent.on(ctx, listener);
  }

  public getAllContexts(action?: string): PluginContext[] {
    const array = Array.from(this.contexts.values());
    return action ? array.filter(context => context.action === action) : array;
  }

  public stop() {
    this.contexts.forEach(c => c.stop());
  }

  send(requestData: RequestData): void {
    ipcRenderer.send(this.identifier, requestData);
  }
}
