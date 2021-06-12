import {ConfigForm} from '../src/';
import assert from 'assert';

describe('Form', () => {
  describe('basic config', () => {
    const config = new ConfigForm([
      {type: 'input_text', key: 'text', default: 'default-value', label: 'label1'},
      {type: 'input_checkbox', key: 'checkbox', default: false, label: 'label2'},
    ]);

    const form = config.getForm();

    it('length', () => {
      assert.strictEqual(form.length, 2);
    });

    it('test text', () => {
      assert.strictEqual(form.get('text'), 'default-value');
    });

    it('test checkbox', () => {
      assert.strictEqual(form.get('checkbox'), false);
    });

    it('test get config', async () => {
      assert.deepStrictEqual(await form.getConfig(), {text: 'default-value', checkbox: false});
    });

    it('test export', async () => {
      assert.deepStrictEqual(await form.export(), [
        {
          default: 'default-value',
          key: 'text',
          label: 'label1',
          type: 'input_text',
          value: 'default-value',
        },
        {
          default: false,
          key: 'checkbox',
          label: 'label2',
          type: 'input_checkbox',
          value: false,
        },
      ]);
    });
  });
  describe('basic async config', () => {
    const config = new ConfigForm([
      {
        type: 'input_text',
        key: 'text',
        label: 'label1',
        default: () =>
          new Promise(resolve => {
            setTimeout(() => resolve('default-value'), 500);
          }),
      },
      {
        type: 'input_checkbox',
        key: 'checkbox',
        label: 'label2',
        default: () =>
          new Promise(resolve => {
            setTimeout(() => resolve(false), 500);
          }),
      },
    ]);

    const form = config.getForm();

    it('length', () => {
      assert.strictEqual(form.length, 2);
    });

    it('test text', async () => {
      assert.strictEqual(await form.get('text'), 'default-value');
    });

    it('test checkbox', async () => {
      assert.strictEqual(await form.get('checkbox'), false);
    });

    it('test get config', async () => {
      assert.deepStrictEqual(await form.getConfig(), {text: 'default-value', checkbox: false});
    });

    it('test export', async () => {
      assert.deepStrictEqual(await form.export(), [
        {
          default: 'default-value',
          key: 'text',
          label: 'label1',
          type: 'input_text',
          value: 'default-value',
        },
        {
          default: false,
          key: 'checkbox',
          label: 'label2',
          type: 'input_checkbox',
          value: false,
        },
      ]);
    });
  });
});
