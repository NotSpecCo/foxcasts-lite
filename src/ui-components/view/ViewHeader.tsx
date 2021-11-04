import { h, VNode } from 'preact';
import { ComponentBaseProps } from '../../models';
import styles from './ViewHeader.module.css';

type Props = ComponentBaseProps & {};

export function ViewHeader(props: Props): VNode {
  return <div className={styles.root}>{props.children}</div>;
}
