import StreamBoardSDKMocked from './StreamBoardSDKMocked';
import assert from 'assert';
import {before} from 'mocha';
import {ipcMain} from './MockElectronPathIpc';
import {PluginContext} from '../src';

describe('Context test', () => {
  const sdk = new StreamBoardSDKMocked();

  afterEach(() => {
    sdk.removeAllListeners();
  });

  it('test1', done => {
    sdk.onContext('action1', context => {
      assert.ok(context instanceof PluginContext);
      done();
    });
    ipcMain.send('initContext', 'uuid1', 'action1', {});
  });

  it('test2', done => {
    sdk.onContext(context => {
      assert.ok(context instanceof PluginContext);
      done();
    });
    ipcMain.send('initContext', 'uuid2', 'action2', {});
  });

  describe('context', () => {
    let context: PluginContext;

    before(done => {
      sdk.onContext(ctx => {
        context = ctx;
        done();
      });
      ipcMain.send('initContext', 'uuid3', 'action3', {});
    });

    it('instance', () => {
      assert.ok(context instanceof PluginContext);
    });

    it('setText', done => {
      context.setText('text');
      ipcMain.on('uuid3/setText', (headers, value) => {
        assert.strictEqual(value, 'text');
        done();
      });
    });

    it('setColor', done => {
      context.setColor('green');
      ipcMain.on('uuid3/setColor', (headers, value) => {
        assert.strictEqual(value, 'green');
        done();
      });
    });

    it('setImage', done => {
      context.setImage('img.jpg');
      ipcMain.on('uuid3/setImage', (headers, value) => {
        assert.strictEqual(value, 'img.jpg');
        done();
      });
    });

    it('properties', () => {
      assert.strictEqual(context.uuid, 'uuid3');
      assert.strictEqual(context.action, 'action3');
    });

    it('onPressDown', done => {
      context.onPressDown(() => {
        done();
      });
      ipcMain.send('uuid3/pressDown');
    });

    it('onPressUp', done => {
      context.onPressUp(({pressDuration}) => {
        assert.strictEqual(pressDuration, 10);
        done();
      });
      ipcMain.send('uuid3/pressUp', {pressDuration: 10});
    });

    it('onStop', done => {
      assert.ok(sdk.getAllContexts().find(ctx => ctx === context));
      context.onStop(() => {
        assert.ok(!sdk.getAllContexts().find(ctx => ctx === context));
        done();
      });
      ipcMain.handleOnce('uuid3/stop', () => true);
      ipcMain.send('uuid3/stop');
    });
  });

  describe('url', () => {
    it('test1', done => {
      sdk.onUrl('test/:id', (params, data) => {
        assert.strictEqual(data.id, '1');
        assert.strictEqual(params.hello, 'world');
        done();
      });
      ipcMain.send('url/test/1', {hello: 'world'});
    });
  });
});
