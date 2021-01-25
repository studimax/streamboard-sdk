import PluginAbstract from "./PluginAbstract";
export default class PluginContext {
    private plugin;
    readonly ctx: string;
    constructor(plugin: PluginAbstract, ctx: string);
    setText(value: string): void;
    setImage(value: string): void;
    setColor(value: string): void;
}
