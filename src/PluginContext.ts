import IPC, {IpcHeaders} from "./IPC";

export class PluginContext extends IPC{
  public readonly cache: {[key: string]: any} = {};

  constructor(
    public readonly uuid: string,
    public readonly action: string,
    public readonly config: any
  ) {
    super();
  }

  protected emit(channel: string, headers: IpcHeaders, ...args: any[]) {
    super.emit(channel, {...headers, ctxUuid: this.uuid}, ...args);
  }

  protected isValidRequest(
      event: any,
      headers: IpcHeaders,
      ...args: any[]
  ): boolean {
    return (
        headers.ctxUuid === this.uuid &&
        super.isValidRequest(event, headers, ...args)
    );
  }

  public getSettings(): Promise<any> {
    return this.invoke('getSettings');
  }

  public setSettings(value: any): void {
    this.send('setSettings', value);
  }

  /**
   * Send a request to set the icon's text
   * @param value
   */
  public setText(value: string): void {
    this.send('setText', value);
  }

  /**
   * Send a request to set the icon's image
   * @param value
   */
  public setImage(value: string): void {
    this.send('setImage', value);
  }

  /**
   * Send a request to set the icon's color
   * @param value
   */
  public setColor(value: string): void {
    this.send('setColor', value);
  }

  /**
   * Listens to pressDown event, when a event arrives listener would be called with listener.
   * @param listener
   */
  public onPressDown(listener: () => void): any {
    return this.on('pressDown',listener);
  }

  /**
   * Listens to pressUp event, when a event arrives listener would be called with listener.
   * @param listener
   */
  public onPressUp(listener: (response:{pressDuration:number}) => void): any {
    return this.on('pressDown',listener);
  }

  public onSettings(listener: (response: any) => any): any {
    return this.on('settings',listener);
  }

  public stop(): Promise<boolean> {
    return this.invoke<boolean>('stop');
  }
}
