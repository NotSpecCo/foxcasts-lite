import { h, VNode } from 'preact';
import { ComponentBaseProps } from '../../models';
import styles from './Grid.module.css';

type Props = ComponentBaseProps & {};

export function Grid(props: Props): VNode {
  return <div className={styles.root}>{props.children}</div>;
}
