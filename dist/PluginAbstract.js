"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const events_1 = require("events");
const PluginContext_1 = __importDefault(require("./PluginContext"));
class PluginAbstract {
    constructor() {
        this.event = new events_1.EventEmitter();
        this.eventAction = new events_1.EventEmitter();
        this.init().then(() => {
            this.emit("ready");
            worker_threads_1.parentPort?.on("message", ({ event, data }) => {
                this.event.emit("*", data);
                this.event.emit(event, data);
                if (event === "action") {
                    this.eventAction.emit(data.action, new PluginContext_1.default(this, data.ctx), data.event, data.data);
                }
            });
        });
    }
    emit(event, data) {
        worker_threads_1.parentPort?.postMessage({
            event,
            data
        });
        return this;
    }
    on(event, listener) {
        return this.event.on(event, listener);
    }
    onAction(action, listener) {
        return this.eventAction.on(action, listener);
    }
    async init() {
        return;
    }
}
exports.default = PluginAbstract;
//# sourceMappingURL=PluginAbstract.js.map