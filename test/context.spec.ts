import StreamBoardSDKMocked from "./StreamBoardSDKMocked";
import { ipcMain } from "./MockElectronPathIpc";
import assert from "assert";
import { PluginContext } from "../src";
import { before } from "mocha";

describe("Context test", () => {
  const sdk = new StreamBoardSDKMocked();

  afterEach(() => {
    sdk.removeAllListeners();
  });

  it("test1", done => {
    sdk.onContext("action1", context => {
      assert.ok(context instanceof PluginContext);
      done();
    });
    ipcMain.send("initContext", "uuid1", "action1", {});
  });

  it("test2", done => {
    sdk.onContext(context => {
      assert.ok(context instanceof PluginContext);
      done();
    });
    ipcMain.send("initContext", "uuid2", "action2", {});
  });

  describe("context", () => {
    let context: PluginContext;
    before(done => {
      sdk.onContext(ctx => {
        context = ctx;
        done();
      });
      ipcMain.send("initContext", "uuid3", "action3", {});
    });
    it("instance", () => {
      assert.ok(context instanceof PluginContext);
    });
    it("setText", done => {
      context.setText("text");
      ipcMain.on("uuid3/setText", (headers, value) => {
        assert.strictEqual(value, "text");
        done();
      });
    });
    it("setColor", done => {
      context.setColor("green");
      ipcMain.on("uuid3/setColor", (headers, value) => {
        assert.strictEqual(value, "green");
        done();
      });
    });
    it("setImage", done => {
      context.setImage("img.jpg");
      ipcMain.on("uuid3/setImage", (headers, value) => {
        assert.strictEqual(value, "img.jpg");
        done();
      });
    });
  });
});
