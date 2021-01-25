import PluginAbstract from "./PluginAbstract";

export default class PluginContext {
    constructor(private plugin: PluginAbstract, public readonly ctx: string) {
    }

    public setText(value: string): void {
        this.plugin.emit("setText", {
            ctx: this.ctx,
            value
        })
    }

    public setImage(value: string): void {
        this.plugin.emit("setImage", {
            ctx: this.ctx,
            value
        })
    }

    public setColor(value: string): void {
        this.plugin.emit("setColor", {
            ctx: this.ctx,
            value
        })
    }
}
