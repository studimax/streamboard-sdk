export interface Input {
  label: string;
  action: string;
  type: string;
  value: any;
}
export interface InputSelect extends Input {
  type: 'input_select';
  items: {label: string; value: any}[];
}
export interface InputText extends Input {
  type: 'input_text';
}
export interface InputTextArea extends Input {
  type: 'input_textarea';
}
export interface InputCheckbox extends Input {
  type: 'input_checkbox';
  value: boolean;
}
export type InputsForms = (InputText | InputTextArea | InputCheckbox | InputSelect)[];
