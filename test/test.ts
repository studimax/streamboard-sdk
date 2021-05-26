import StreamBoardSDK from '../src/';

(async () => {
  const sdk = new StreamBoardSDK();
  sdk.setGlobalConfig([
    {type: 'input_text', action: 'test1', default: () => 'caca'},
    {type: 'input_checkbox', action: 'test2', default: () => true},
    {type: 'input_checkbox', action: 'test3'},
    {type: 'input_file', action: 'test4', accept: '.mp3,audio/*', default: () => 'pipi'},
    {type: 'input_select', action: 'test5', items: () => [{value: 'caca', label: 'Caca'}]},
  ]);
  sdk.setActionConfig('action', [
    {type: 'input_text', action: 'test1', default: () => 'caca'},
    {type: 'input_checkbox', action: 'test2', default: () => true},
    {type: 'input_checkbox', action: 'test3'},
    {type: 'input_file', action: 'test4', accept: '.mp3,audio/*', default: () => 'pipi'},
    {type: 'input_select', action: 'test5', items: () => [{value: 'caca', label: 'Caca'}]},
  ]);
  const config = sdk.getGlobalConfig();
  console.log('global', await config.getAction('test1')?.getValue());
  const form = sdk.getActionConfig('action');
  form.getAction('test')?.setValue('yolo');
  form.setConfig({
    test1: 1,
    test2: 2,
    test3: 3,
  });
  console.log(await form.getConfig());
  console.log(await form.export());

  sdk.onContext('test', (context, config) => {});
  sdk.onContext(() => {});
})();
