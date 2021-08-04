import { h, VNode } from 'preact';
import { ComponentBaseProps } from '../models';
import { joinClasses } from '../utils/classes';
import styles from './MenuBar.module.css';

type Props = ComponentBaseProps & {
  leftText?: string;
  centerText?: string;
  rightText?: string;
};

export function MenuBar(props: Props): VNode {
  return (
    <div className={joinClasses(styles.root, props.className)}>
      <div className={styles.left}>{props.leftText}</div>
      <div className={styles.center}>{props.centerText}</div>
      <div className={styles.right}>{props.rightText}</div>
    </div>
  );
}
