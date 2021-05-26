import {Ipc, ipcRenderer} from 'electron-path-ipc';
import EventEmitter from 'events';
import {Form} from './InputForm';
import StreamBoardSDK from './StreamBoardSDK';

export class PluginContext {
  /**
   * cache is a free variable could be use to store data in context
   */
  public readonly cache: {[key: string]: any} = {};
  private readonly event = new EventEmitter();
  private readonly ipc: Ipc;
  private stopped?: Promise<boolean>;
  private readonly config: Form;

  constructor(
    public readonly parent: StreamBoardSDK,
    public readonly uuid: string,
    public readonly action: string,
    config: {[key: string]: any},
    ipc: Ipc = ipcRenderer
  ) {
    this.config = this.parent.getActionConfig(action);
    this.config.setConfig(config);
    this.ipc = ipc
      .prefix(uuid)
      .once('stop', () => this.stop())
      .on('settings', async (event, config) => {
        this.config.setConfig(config);
        this.event.emit('settings', await this.getConfig());
      })
      .handle('configForm', async () => await this.config.export());
  }

  public setConfig(config: {[key: string]: any}) {
    this.config.setConfig(config);
  }

  public getConfig<T = {[key: string]: any}>(): Promise<T> {
    return this.config.getConfig() as Promise<T>;
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

  public onStop(listener: () => void): this {
    this.event.on('stop', listener);
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
            this.event.emit('stop');
            this.ipc.removeAll();
            this.parent.removeContext(this.uuid);
          }
          return response;
        }));
  }
}
