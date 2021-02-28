import PluginAbstract, {EventName} from "../../../src/index";

class SimplePlugin extends PluginAbstract {
    constructor() {
        super();
    }

    protected async init(): Promise<void> {
        console.log("plugin connected");
        this.on("connected", context => {
            let i = 0;
            context.setText("...");
            context.setColor("#1452bc");
            context.on(EventName.CLICK, () => {
                if (++i % 2 == 0) {
                    context.setText("Hello");
                    context.setColor("#14bc30");
                } else {
                    context.setText("World");
                    context.setColor("#cf0000");
                }
            });
        });
    }
}

new SimplePlugin();
