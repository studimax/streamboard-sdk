import {Ipc, ipcRenderer} from 'electron-path-ipc';
import StreamBoardSDK from './StreamBoardSDK';

export class PluginContext {
  /**
   * cache is a free variable could be use to store data in context
   */
  public readonly cache: {[key: string]: any} = {};
  private readonly ipc: Ipc;
  private stopped?: Promise<boolean>;

  constructor(
    public readonly parent: StreamBoardSDK,
    public readonly uuid: string,
    public readonly action: string,
    public readonly config: any,
    ipc: Ipc = ipcRenderer
  ) {
    this.ipc = ipc.prefix(uuid);
    this.ipc.once('stop', () => this.stop());
  }

  public getSettings(): Promise<any> {
    return this.ipc.invoke('getSettings');
  }

  /**
   * Send a request to set the context's settings
   * @param value
   */
  public setSettings(value: any): this {
    this.ipc.send('setSettings', value);
    return this;
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
   * Listens to onSettings event, when a event arrives listener would be called with listener.
   * @param listener
   */
  public onSettings(listener: (response: any) => any): this {
    this.ipc.on('settings', (event, response) => listener(response));
    return this;
  }

  /**
   * Stop the context
   */
  public stop(): Promise<boolean> {
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
