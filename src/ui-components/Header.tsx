import { h } from 'preact';
import { ComponentBaseProps } from '../models';
import styles from './Header.module.css';

type Props = ComponentBaseProps & {
  text?: string;
};

export function Header(props: Props): any {
  return <div className={styles.root}>{props.text}</div>;
}
