import { h } from 'preact';
import { forwardRef } from 'preact/compat';
import { ComponentBaseProps } from '../models';
import { ifClass, joinClasses } from '../utils/classes';
import styles from './ListItem.module.css';

type Props = ComponentBaseProps & {
  isSelected?: boolean;
  shortcutKey?: string | number;
  imageUrl?: string;
  primaryText?: string;
  secondaryText?: string;
  accentText?: string;
  onClick?: () => void;
};

export const ListItem = forwardRef(
  ({ isSelected = false, ...props }: Props, ref: any) => {
    return (
      <div
        ref={ref}
        className={joinClasses(
          styles.root,
          ifClass(isSelected, styles.selected)
        )}
        onClick={(): void => props.onClick?.()}
      >
        {props.shortcutKey ? (
          <div className={styles.shortcut}>{props.shortcutKey}</div>
        ) : null}
        {props.imageUrl ? <img src={props.imageUrl} /> : null}
        <div className={styles.text}>
          <div className={styles.primary}>{props.primaryText}</div>
          <div className={styles.secondary}>{props.secondaryText}</div>
          <div className={styles.accent}>{props.accentText}</div>
        </div>
      </div>
    );
  }
);
