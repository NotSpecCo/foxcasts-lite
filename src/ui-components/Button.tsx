import { h, VNode } from 'preact';
import { ComponentBaseProps } from '../models';
import { joinClasses } from '../utils/classes';
import styles from './Button.module.css';

type Props = ComponentBaseProps & {
  text?: string;
  disabled?: boolean;
};

export function Button(props: Props): VNode {
  return (
    <button
      className={joinClasses(styles.root, props.className)}
      data-selectable-priority={props['data-selectable-priority']}
      data-selectable-id={props['data-selectable-id']}
      disabled={props.disabled}
    >
      {props.text}
    </button>
  );
}
