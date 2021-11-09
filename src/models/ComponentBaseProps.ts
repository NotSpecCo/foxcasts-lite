import { h } from 'preact';

export type ComponentBaseProps = {
  className?: string;
  style?: h.JSX.CSSProperties;
  title?: string;
  children?: any;
  'data-testid'?: string;
};
