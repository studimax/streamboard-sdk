import {ipcMain, ipcRenderer} from './MockElectronPathIpc';
import StreamBoardSDK from '../src';

const proxyquire: any = require('proxyquire');

const StreamBoardSDKMocked: typeof StreamBoardSDK = proxyquire('../src/StreamBoardSDK.ts', {
  'electron-path-ipc': {
    ipcMain,
    ipcRenderer,
  },
}).default;
export default StreamBoardSDKMocked;
