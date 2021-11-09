import { h, VNode } from 'preact';
import { ComponentBaseProps } from '../models';
import { joinClasses } from '../utils/classes';
import styles from './Typography.module.css';

type Props = ComponentBaseProps & {
  display?: 'block' | 'inline';
  type?:
    | 'caption'
    | 'body'
    | 'bodyStrong'
    | 'bodyLarge'
    | 'titleSmall'
    | 'subtitle'
    | 'title'
    | 'titleLarge';
  color?: 'primary' | 'secondary' | 'accent';
  decoration?: 'none' | 'underline';
  transform?: 'none' | 'uppercase' | 'lowercase';
  align?: 'left' | 'center' | 'right';
  padding?: 'vertical' | 'horizontal' | 'both' | 'none';
  wrap?: 'wrap' | 'nowrap';
};

export function Typography({
  display = 'block',
  type = 'body',
  color = 'primary',
  decoration = 'none',
  transform = 'none',
  align = 'left',
  padding = 'both',
  wrap = 'wrap',
  ...props
}: Props): VNode {
  return (
    <div
      className={joinClasses(
        styles.root,
        styles[display],
        styles[type],
        styles[color],
        styles[decoration],
        styles[transform],
        styles[align],
        styles[`padding-${padding}`],
        styles[wrap],
        props.className
      )}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
