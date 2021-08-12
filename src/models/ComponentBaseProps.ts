export type ComponentBaseProps = {
  className?: string;
  style?: { [key: string]: string | number };
  title?: string;
  children?: any;
  'data-testid'?: string;
  'data-selectable-priority'?: string;
  'data-selectable-id'?: string;
};
