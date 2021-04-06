import {
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron';
import * as uuid from 'uuid';

export type IpcEvent = IpcMainEvent | IpcRendererEvent;
export type HandleListener = (...args: any[]) => Promise<any> | any;
export type Listener = (...args: any[]) => any;

export default class IPC {
  private handleMap = new Map<string, HandleListener>();
  private eventMap = new Map<string, Listener[][]>();
  private ipc: Electron.IpcRenderer | Electron.IpcMain;

  constructor(private win?: BrowserWindow) {
    this.ipc = ipcMain ?? ipcRenderer;
  }

  protected emit(channel: string, requestId: any, ...args: any[]) {
    if (this.win) {
      this.win.webContents.send(channel, requestId, ...args);
    } else if (ipcRenderer) {
      ipcRenderer.send(channel, requestId, ...args);
    } else {
      throw new Error('Message not send');
    }
  }

  public setBrowserWindow(win: BrowserWindow) {
    this.win = win;
  }

  public send(channel: string, ...args: any[]) {
    this.emit(channel, null, ...args);
  }

  protected isValidRequest(event: any, handleId: any, ...args: any[]): boolean {
    return (
        !this.win ||
        !event.sender?.id ||
        event.sender.id === this.win.webContents.id
    );
  }

  public on(channel: string, listener: Listener) {
    const func = (event: IpcEvent, handleId: any, ...args: any[]) => {
      if (this.isValidRequest(event, handleId, ...args)) listener(...args);
    };
    this.eventMap.set(channel, [
      ...(this.eventMap.get(channel) ?? []),
      [listener, func],
    ]);
    this.ipc.on(channel, func);
  }

  public once(channel: string, listener: Listener) {
    const func = (event: IpcEvent, handleId: any, ...args: any[]) => {
      if (!this.isValidRequest(event, handleId, ...args)) return;
      this.ipc.removeListener(channel, func);
      listener(...args);
    };
    this.eventMap.set(channel, [
      ...(this.eventMap.get(channel) ?? []),
      [listener, func],
    ]);
    this.ipc.on(channel, func);
  }

  public handle(channel: string, listener: HandleListener): void {
    if (this.handleMap.has(channel)) {
      throw new Error(
          `Attempted to register a second handler for '${channel}'`
      );
    }
    const func = async (event: IpcEvent, handleId: any, ...args: any[]) => {
      if (!this.isValidRequest(event, handleId, ...args)) return;
      this.emit(`${channel}-${handleId}`, handleId, await listener(...args));
    };
    this.handleMap.set(channel, func);
    this.ipc.on(channel, func);
  }

  public handleOnce(channel: string, listener: HandleListener): void {
    if (this.handleMap.has(channel)) {
      throw new Error(
          `Attempted to register a second handler for '${channel}'`
      );
    }
    const func = async (event: IpcEvent, handleId: any, ...args: any[]) => {
      if (!this.isValidRequest(event, handleId, ...args)) return;
      this.removeHandler(channel);
      this.emit(`${channel}-${handleId}`, handleId, await listener(...args));
    };
    this.handleMap.set(channel, func);
    this.ipc.once(channel, func);
  }

  public invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    return new Promise(resolve => {
      const handleId = uuid.v4();
      this.once(`${channel}-${handleId}`, resolve);
      this.emit(channel, handleId, ...args);
    });
  }

  public removeHandler(channel?: string): void {
    if (channel) {
      const func = this.handleMap.get(channel);
      if (func) {
        this.ipc.removeListener(channel, func);
        this.handleMap.delete(channel);
      }
    } else {
      this.handleMap.forEach((func, channel) => {
        this.ipc.removeListener(channel, func);
        this.handleMap.delete(channel);
      });
    }
  }

  public removeListener(channel: string, listener: Listener) {
    const l = this.eventMap.get(channel)?.find(l => l[0] === listener);
    if (l) this.ipc.removeListener(channel, l[1]);
  }

  public removeAllListeners(channel?: string) {
    if (channel) {
      this.eventMap.get(channel)?.forEach(listener => {
        this.ipc.removeListener(channel, listener[1]);
      });
      this.eventMap.delete(channel);
    } else {
      this.eventMap.forEach((listeners, channel) => {
        listeners.forEach(listener => {
          this.ipc.removeListener(channel, listener[1]);
        });
        this.eventMap.delete(channel);
      });
    }
  }

  public eventNames(): Array<string> {
    return Array.from(this.eventMap.keys());
  }

  public listenerCount(event: string): number {
    return this.eventMap.get(event)?.length ?? 0;
  }

  public listeners(event: string): Function[] {
    return this.eventMap.get(event)?.map(i => i[0]) ?? [];
  }

  public handlerNames(): Array<string> {
    return Array.from(this.handleMap.keys());
  }

  public handlerCount(event: string): number {
    return this.handleMap.get(event)?.length ?? 0;
  }
}
