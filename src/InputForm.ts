type InputOption<T = any> = {
  key: string;
  label?: string;
  value?: T;
  default?: T | (() => T | Promise<T>);
};

type InputSelectOption<T = any> = InputOption<T> & {
  items?: () => {label: string; value: T}[] | Promise<{label: string; value: T}[]>;
};

type InputFileOption<T = any> = InputOption<T> & {
  accept?: string;
};

abstract class Input<T = any> {
  public static readonly type: string = 'input';
  ['constructor']: typeof Input;
  public readonly key: string;
  public readonly label: string;
  private readonly default: T | (() => Promise<T> | T);
  private value?: T;

  protected constructor(options: InputOption<T>) {
    this.key = options.key;
    this.label = options.label ?? '';
    this.value = options.value;
    this.default = options.default ?? (() => (undefined as unknown) as T);
  }

  public getDefaultValue(): T | Promise<T> {
    return this.default instanceof Function ? this.default() : this.default;
  }

  public getValue(): T | undefined {
    return this.value;
  }

  public get(): Promise<T> | T {
    return this.getValue() ?? this.getDefaultValue();
  }

  public setValue(value: T) {
    this.value = value;
  }

  async export(): Promise<{[key: string]: any}> {
    const defaultValue = await this.getDefaultValue();
    return {
      type: this.constructor.type,
      key: this.key,
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

class InputFile extends Input<string> {
  public static readonly type: string = 'input_file';
  private readonly accept?: string;

  constructor(options: InputFileOption<string>) {
    super(options);
    this.accept = options.accept;
  }

  async export(): Promise<{[key: string]: any}> {
    return {
      ...(await super.export()),
      accept: this.accept,
    };
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
  | ({type: 'input_file'} & ConstructorParameters<typeof InputFile>[0])
  | ({type: 'input_textarea'} & ConstructorParameters<typeof InputTextArea>[0])
  | ({type: 'input_checkbox'} & ConstructorParameters<typeof InputCheckbox>[0])
  | ({type: 'input_select'} & ConstructorParameters<typeof InputSelect>[0]);

export class Form extends Array<Input> {
  public setConfig<T = {[key: string]: any}>(config: T): void {
    Object.entries(config).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  public async getConfig<T = {[key: string]: any}>(): Promise<T> {
    return Object.fromEntries(await Promise.all(this.map(async input => [input.key, await input.get()])));
  }

  public get(key: string): any | undefined {
    const input = this.getAction(key);
    if (!input) return;
    return input.get();
  }

  public set(key: string, value: any): void {
    this.getAction(key)?.setValue(value);
  }

  public export(): Promise<{[key: string]: any}> {
    return Promise.all(Array.from(this).map(async input => await input.export()));
  }

  private getAction<T = any, U extends Input<T> = Input<T>>(key: string): U | undefined {
    return this.find(i => i.key === key) as U | undefined;
  }
}

export class ConfigForm {
  private static readonly inputClass = ConfigForm.addInputs(
    InputText,
    InputFile,
    InputTextArea,
    InputCheckbox,
    InputSelect
  );
  private inputs: Inputs[] = [];

  constructor(inputs: Inputs[]) {
    this.setInputs(inputs);
  }

  private static addInputs(...input: any[]) {
    const inputClass = new Map<string, new (options: Inputs) => Input>();
    input.forEach(input => inputClass.set(input.type, input));
    return inputClass;
  }

  public setInputs(inputs: Inputs[]) {
    this.inputs = inputs.filter(input => ConfigForm.inputClass.has(input.type));
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
