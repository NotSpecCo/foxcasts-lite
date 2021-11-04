import { h, VNode } from 'preact';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { joinClasses } from '../../utils/classes';
import styles from './Button.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    text?: string;
    disabled?: boolean;
  };

export function Button(props: Props): VNode {
  return (
    <button
      className={joinClasses(styles.root, props.className)}
      data-selectable-priority={props.selectable?.priority}
      data-selectable-id={props.selectable?.id}
      disabled={props.disabled}
    >
      {props.text}
    </button>
  );
}
