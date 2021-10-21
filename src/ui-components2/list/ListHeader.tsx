import { h, VNode } from 'preact';
import { ComponentBaseProps } from '../../models';
import styles from './ListHeader.module.css';

type Props = ComponentBaseProps & {};

export function ListHeader(props: Props): VNode {
  return <div className={styles.root}>{props.children}</div>;
}
