import {Ipc, ipcRenderer} from 'electron-path-ipc';
import EventEmitter from 'events';
import StreamBoardSDK from './StreamBoardSDK';

export class PluginContext {
  /**
   * cache is a free variable could be use to store data in context
   */
  public readonly cache: {[key: string]: any} = {};
  private readonly event = new EventEmitter();
  private readonly ipc: Ipc;
  private stopped?: Promise<boolean>;
  private readonly config = new Map<string, any>();

  constructor(
    public readonly parent: StreamBoardSDK,
    public readonly uuid: string,
    public readonly action: string,
    config: {[key: string]: any},
    ipc: Ipc = ipcRenderer
  ) {
    this.parent.getConfigForm(action).forEach(({action, value}) => {
      this.config.set(action, (config ?? {})[action] ?? value);
    });
    this.ipc = ipc.prefix(uuid);
    this.ipc.once('stop', () => this.stop());
    this.ipc.on('settings', (event, response) => {
      this.setConfig(response);
      this.event.emit('settings', this.getConfig());
    });
  }

  public getConfig<T = {[key: string]: any}>(): T {
    return Object.fromEntries(this.config) as T;
  }

  public setConfig<T = {[key: string]: any}>(config: T): void {
    for (const configKey in config) {
      if (this.config.has(configKey)) {
        this.config.set(configKey, config[configKey]);
      }
    }
  }

  /**
   * Send a request to set the icon's text
   * @param value
   */
  public setText(value: string): this {
    this.ipc.send('setText', value);
    return this;
  }

  /**
   * Send a request to set the icon's image
   * @param value
   */
  public setImage(value: string): this {
    this.ipc.send('setImage', value);
    return this;
  }

  /**
   * Send a request to set the icon's color
   * @param value
   */
  public setColor(value: string): this {
    this.ipc.send('setColor', value);
    return this;
  }

  /**
   * Send a request to send something
   * @param path
   * @param value
   */
  public send(path: string, value: string): this {
    this.ipc.send(path, value);
    return this;
  }

  /**
   * Listens to pressDown event, when a event arrives listener would be called with listener.
   * @param listener
   */
  public onPressDown(listener: (response: any) => void): this {
    this.ipc.on('pressDown', (event, response) => listener(response));
    return this;
  }

  /**
   * Listens to pressUp event, when a event arrives listener would be called with listener.
   * @param listener
   */
  public onPressUp(listener: (response: {pressDuration: number}) => void): this {
    this.ipc.on('pressUp', (event, response) => listener(response));
    return this;
  }

  /**
   * Listens to on event, when a event arrives listener would be called with listener.
   * @param path
   * @param listener
   */
  public on(path: string, listener: (response: any) => void): this {
    this.ipc.on(path, (event, response) => listener(response));
    return this;
  }

  /**
   * Listens to once event, when a event arrives listener would be called with listener.
   * @param path
   * @param listener
   */
  public once(path: string, listener: (response: any) => void): this {
    this.ipc.once(path, (event, response) => listener(response));
    return this;
  }

  /**
   * Listens to onSettings event, when a event arrives listener would be called with listener.
   * @param listener
   */
  public onSettings(listener: (config: {[key: string]: any}) => void): this {
    this.event.on('settings', listener);
    return this;
  }

  /**
   * Stop the context
   */
  public async stop(): Promise<boolean> {
    return this.stopped
      ? this.stopped
      : (this.stopped = this.ipc.invoke<boolean>('stop').then(response => {
          if (response) {
            this.ipc.removeAll();
            this.parent.removeContext(this.uuid);
          }
          return response;
        }));
  }
}
