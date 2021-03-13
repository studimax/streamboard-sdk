import {expect} from 'chai';
import StreamBoardSDK from "../src/index";
import {v4} from "uuid";
import Simulator from "./Simulator";

const simulator = new Simulator();
const sdk = new StreamBoardSDK(simulator);
describe("TestPlugin", () => {

    describe("Events", () => {

        it("should get received event", (done) => {
            sdk.on("test", response => {
                expect(response.event).to.equal("test");
                expect(response.payload).to.equal(true);
                done();
            });
            simulator.post({
                event: "test",
                payload: true
            });
        });

        it("should get received click event", (done) => {
            const uuid = v4();
            sdk.on("connected", context => {
                context.onClick(response => {
                    expect(response.payload).to.equal(true);
                    done();
                })
            });
            simulator
                .post({
                    ctx: uuid,
                    event: "connected",
                    payload: {
                        action: "test",
                        config: {
                            hello: "world"
                        }
                    }
                })
                .post({
                    ctx: uuid,
                    event: "click",
                    payload: true
                });
        });

        it("verify context", (done) => {
            const uuid = v4();
            sdk.on("connected", context => {
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
