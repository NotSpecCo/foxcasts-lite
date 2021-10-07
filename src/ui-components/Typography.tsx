import { h } from 'preact';
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
    | 'subtitle'
    | 'title'
    | 'titleLarge';
  color?: 'primary' | 'secondary' | 'accent';
  decoration?: 'none' | 'underline';
  transform?: 'none' | 'uppercase' | 'lowercase';
  align?: 'left' | 'center' | 'right';
};

export function Typography({
  display = 'block',
  type = 'body',
  color = 'primary',
  decoration = 'none',
  transform = 'none',
  align = 'left',
  ...props
}: Props) {
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
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
