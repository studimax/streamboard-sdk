import {remote} from 'electron';
import {PluginContext} from './PluginContext';
import IPC from "./IPC";

export default class StreamBoardSDK extends IPC{
  private readonly contexts: Map<string, PluginContext> = new Map<
    string,
    PluginContext
  >();
  private readonly identifier =
    new URL(location.toString()).searchParams.get('identifier') ?? '';

  constructor() {
    super();
    if (!this.identifier) remote.getCurrentWindow().close();
  }

  /**
   * Send to the main process that the plugin is ready
   */
  public async ready(): Promise<boolean> {
    return await this.invoke<boolean>('ready');
  }

  public onConnection(
    listener: (context: PluginContext) => void
  ) {
    return this.on('initContext', (uuid:string,action:string,config:any)=>{
            const context = new PluginContext(uuid, action, config);
            this.contexts.set(uuid,context);
            listener(context);
    });
  }

  public getAllContexts(action?: string): PluginContext[] {
    const array = Array.from(this.contexts.values());
    return action ? array.filter(context => context.action === action) : array;
  }

  public stop() {
    this.contexts.forEach(ctx => ctx.stop());
  }
}
