type InputOption<T = any> = {
  action: string;
  label?: string;
  default?: () => T | Promise<T>;
};

type InputSelectOption<T = any> = InputOption<T> & {
  items?: () => {label: string; value: T}[] | Promise<{label: string; value: T}[]>;
};

abstract class Input<T = any> {
  public static readonly type: string = 'input';
  ['constructor']: typeof Input;
  public readonly action: string;
  public readonly label: string;
  private readonly default: () => Promise<T> | T;
  private value?: T;

  protected constructor(options: InputOption<T>) {
    this.action = options.action;
    this.label = options.label ?? '';
    this.default = options.default ?? (() => (undefined as unknown) as T);
  }

  public async getValue() {
    return this.value ?? (await this.default());
  }

  public setValue(value: T) {
    this.value = value;
  }

  async export(): Promise<{[key: string]: any}> {
    const defaultValue = await this.default();
    return {
      type: this.constructor.type,
      action: this.action,
      label: this.label,
      value: this.value ?? defaultValue,
      default: defaultValue,
    };
  }
}

class InputText extends Input<string> {
  public static readonly type: string = 'input_text';
  constructor(options: InputOption<string>) {
    super({...options, default: options.default ?? (() => '')});
  }
}

class InputTextArea extends Input<string> {
  public static readonly type: string = 'input_textarea';
  constructor(options: InputOption<string>) {
    super({...options, default: options.default ?? (() => '')});
  }
}

class InputCheckbox extends Input<boolean> {
  public static readonly type: string = 'input_checkbox';
  constructor(options: InputOption<boolean>) {
    super({...options, default: options.default ?? (() => false)});
  }
}

class InputSelect<T = any> extends Input<T> {
  public static readonly type: string = 'input_select';
  private readonly items: () => {label: string; value: T}[] | Promise<{label: string; value: T}[]>;
  constructor(options: InputSelectOption<T>) {
    super(options);
    this.items = options.items ?? (() => []);
  }
  async export(): Promise<{[key: string]: any}> {
    return {
      ...(await super.export()),
      items: await this.items(),
    };
  }
}

type Inputs =
  | ({type: 'input_text'} & ConstructorParameters<typeof InputText>[0])
  | ({type: 'input_textarea'} & ConstructorParameters<typeof InputTextArea>[0])
  | ({type: 'input_checkbox'} & ConstructorParameters<typeof InputCheckbox>[0])
  | ({type: 'input_select'} & ConstructorParameters<typeof InputSelect>[0]);

export class Form extends Array<Input> {
  public getAction<T = any, U extends Input<T> = Input<T>>(action: string): U | undefined {
    return this.find(i => i.action === action) as U | undefined;
  }

  public setConfig<T = {[key: string]: any}>(config: T): void {
    for (const key in config) {
      this.getAction(key)?.setValue(config[key]);
    }
  }

  public async getConfig(): Promise<{[key: string]: any}> {
    return Object.fromEntries(
      await Promise.all(Array.from(this).map(async input => [input.action, await input.getValue()]))
    );
  }

  public export(): Promise<{[key: string]: any}> {
    return Promise.all(Array.from(this).map(async input => await input.export()));
  }
}

export class ConfigForm {
  private static readonly inputClass = ConfigForm.addInputs(InputText, InputTextArea, InputCheckbox, InputSelect);
  private readonly inputs: Inputs[];
  constructor(inputs: Inputs[]) {
    this.inputs = inputs.filter(input => ConfigForm.inputClass.has(input.type));
  }

  private static addInputs(...input: any[]) {
    const inputClass = new Map<string, new (options: Inputs) => Input>();
    input.forEach(input => inputClass.set(input.type, input));
    return inputClass;
  }

  public getForm(): Form {
    const inputs: Input[] = [];
    this.inputs.forEach(input => {
      const inputClass = ConfigForm.inputClass.get(input.type);
      if (inputClass) inputs.push(new inputClass(input));
    });
    return new Form(...inputs);
  }
}
