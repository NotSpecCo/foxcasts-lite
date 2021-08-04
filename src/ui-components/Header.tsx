import { h, VNode } from 'preact';
import { ComponentBaseProps } from '../models';
import { joinClasses } from '../utils/classes';
import styles from './Header.module.css';

type Props = ComponentBaseProps & {
  text?: string;
};

export function Header(props: Props): VNode {
  return (
    <div className={joinClasses(styles.root, props.className)}>
      {props.text}
    </div>
  );
}
