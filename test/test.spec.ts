import {expect} from 'chai';
import PluginAbstract from "../src";
import {v4} from "uuid";
import Simulator from "./Simulator";

const simulator = new Simulator();

class TestPlugin extends PluginAbstract {
    protected parent: Simulator = simulator;

    constructor() {
        super();
    }
}

describe("TestPlugin", () => {
    const plugin = new TestPlugin();

    describe("Events", () => {

        it("should get received event", (done) => {
            plugin.on("test", response => {
                expect(response.event).to.equal("test");
                expect(response.payload).to.equal(true);
                done();
            });
            simulator.post({
                event: "test",
                payload: true
            });
        });

        it("verify context", (done) => {
            const uuid = v4();
            plugin.on("connected", context => {
                expect(context.uuid).to.equal(uuid);
                expect(context.action).to.equal("test");
                expect(context.config.hello).to.equal("world");
                done();
            });

            simulator.post({
                ctx: uuid,
                event: "connected",
                payload: {
                    action: "test",
                    config: {
                        hello: "world"
                    }
                }
            });
        });

    })
});
