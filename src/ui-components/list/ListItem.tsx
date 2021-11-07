import { h } from 'preact';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { joinClasses } from '../../utils/classes';
import { SelectableBase } from '../hoc';
import styles from './ListItem.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    imageUrl?: string;
    primaryText?: string;
    secondaryText?: string;
    accentText?: string;
    selected?: boolean;
  };

export function ListItem(props: Props): h.JSX.Element {
  return (
    <SelectableBase
      {...props.selectable}
      ariaLabel={[
        props.primaryText,
        props.secondaryText,
        props.accentText,
      ].join(' . ')}
      className={joinClasses(styles.root)}
    >
      {/* {props.shortcutKey ? (
          <div className={styles.shortcut}>{props.shortcutKey}</div>
        ) : null} */}
      {props.imageUrl ? <img src={props.imageUrl} /> : null}
      <div className={styles.text}>
        <div className={styles.primary}>
          {props.selectable?.shortcut ? (
            <span className={styles.shortcut}>
              {props.selectable?.shortcut}
            </span>
          ) : null}
          {props.primaryText}
        </div>
        {props.secondaryText ? (
          <div className={styles.secondary}>{props.secondaryText}</div>
        ) : null}
        {props.accentText ? (
          <div className={styles.accent}>{props.accentText}</div>
        ) : null}
      </div>
    </SelectableBase>
  );
}
