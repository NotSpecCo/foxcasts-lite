import { h } from 'preact';
import { ComponentBaseProps } from '../models';
import styles from './MenuBar.module.css';

type Props = ComponentBaseProps & {
  leftText?: string;
  centerText?: string;
  rightText?: string;
};

export function MenuBar(props: Props): any {
  return (
    <div className={styles.root}>
      <div className={styles.left}>{props.leftText}</div>
      <div className={styles.center}>{props.centerText}</div>
      <div className={styles.right}>{props.rightText}</div>
    </div>
  );
}
