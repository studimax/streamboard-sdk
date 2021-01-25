"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PluginContext {
    constructor(plugin, ctx) {
        this.plugin = plugin;
        this.ctx = ctx;
    }
    setText(value) {
        this.plugin.emit("setText", {
            ctx: this.ctx,
            value
        });
    }
    setImage(value) {
        this.plugin.emit("setImage", {
            ctx: this.ctx,
            value
        });
    }
    setColor(value) {
        this.plugin.emit("setColor", {
            ctx: this.ctx,
            value
        });
    }
}
exports.default = PluginContext;
//# sourceMappingURL=PluginContext.js.map