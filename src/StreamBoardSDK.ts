import {PluginContext} from './PluginContext';
import {ipcRenderer} from 'electron-path-ipc';

export default class StreamBoardSDK {
  private readonly contexts: Map<string, PluginContext> = new Map<string, PluginContext>();
  private readonly identifier = new URL(location.toString()).searchParams.get('identifier') ?? '';
  private readonly ipc = ipcRenderer.prefix(this.identifier);

  constructor() {
    this.ipc.once('stop', () => this.stop());
  }

  /**
   * Send to the main process that the plugin is ready
   */
  public async ready(): Promise<boolean> {
    return await this.ipc.invoke<boolean>('ready');
  }

  /**
   * Is executed when a new context is added on StreamBoard, the context instance is returned.
   * @param listener
   */
  public onConnection(listener: (context: PluginContext) => void): this {
    this.ipc.on('initContext', (header, uuid: string, action: string, config: any) => {
      const context = new PluginContext(this, uuid, action, config, this.ipc);
      this.contexts.set(uuid, context);
      listener(context);
    });
    return this;
  }

  /**
   * Return the list of all context can be filtered by action
   * @param action
   */
  public getAllContexts(action?: string): PluginContext[] {
    const array = Array.from(this.contexts.values());
    return action ? array.filter(context => context.action === action) : array;
  }

  /**
   * Stop all contexts and the plugin
   */
  public stop(): this {
    this.contexts.forEach((value, key) => this.removeContext(key));
    this.ipc.removeAll();
    return this;
  }

  public async removeContext(ctx: string): Promise<void> {
    if (await this.contexts.get(ctx)?.stop()) {
      this.contexts.delete(ctx);
    }
  }
}
