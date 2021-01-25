import PluginAbstract, {PluginContext} from "../dist";

class Plugin extends PluginAbstract {
    constructor() {
        super();
    }
}

const p = new Plugin();
console.log(new PluginContext(p, "test"));
console.log(p);
