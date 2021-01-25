import PluginContext from "./PluginContext";
import { EventName } from "./EventName";
export default abstract class PluginAbstract {
    private event;
    private eventAction;
    protected constructor();
    emit(event: string, data?: any): this;
    on(event: string | symbol | "*", listener: (...args: any[]) => void): any;
    onAction(action: string, listener: (ctx: PluginContext, event: EventName, data: any) => void): any;
    protected init(): Promise<void>;
}
