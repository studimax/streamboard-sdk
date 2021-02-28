import PluginAbstract from "../../../src";

class SimplePlugin extends PluginAbstract {
    constructor() {
        super();
    }

    protected async init(): Promise<void> {
        console.log("plugin connected");
    }
}

const p = new SimplePlugin();
p.on("connected", async context => {
    const settings = await context.getSettings();
})
