import {IpcMain, IpcRenderer} from 'electron-path-ipc';
import createIPCMock from 'electron-mock-ipc';

const proxyquire: any = require('proxyquire');
const ipcMock = createIPCMock();

const mockWebContents: {webContents: any}[] = [];

ipcMock.ipcMain.once('saveMockWebContentsSend', event => {
  mockWebContents.push({webContents: event.sender});
});
ipcMock.ipcRenderer.send('saveMockWebContentsSend');

export const {ipcMain, ipcRenderer}: {ipcMain: IpcMain; ipcRenderer: IpcRenderer} = proxyquire('electron-path-ipc', {
  electron: {
    ipcMain: ipcMock.ipcMain,
    ipcRenderer: ipcMock.ipcRenderer,
    BrowserWindow: {
      getAllWindows() {
        return mockWebContents;
      },
    },
  },
});
