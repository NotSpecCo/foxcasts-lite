import { h } from 'preact';
import { ComponentBaseProps, SelectableProps } from '../models';
import { SelectableBase } from './hoc';
import { IconName, IconSize, SvgIcon } from './SvgIcon';
import styles from './Tile.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    icon: IconName;
    frontText?: string;
    backText: string;
  };

export function Tile(props: Props): h.JSX.Element {
  return (
    <SelectableBase {...props.selectable} className={styles.root}>
      <div className={styles.content}>
        <div className={styles.back}>{props.backText}</div>
        <div className={styles.front}>
          <SvgIcon
            className={styles.icon}
            icon={props.icon}
            size={IconSize.Large}
          />
        </div>
      </div>
    </SelectableBase>
  );
}
