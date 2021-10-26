import { h } from 'preact';
import { ComponentBaseProps, SelectableProps } from '../models';
import { SelectableBase, withSelectable } from './hoc';
import { IconName, SvgIcon } from './SvgIcon';
import styles from './Tile.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    icon: IconName;
    frontText?: string;
    backText: string;
  };

export const Tile = withSelectable<Props>((props: Props): h.JSX.Element => {
  return (
    <SelectableBase {...props.selectable} className={styles.root}>
      <div className={styles.content}>
        <div className={styles.back}>{props.backText}</div>
        <div className={styles.front}>
          <SvgIcon className={styles.icon} icon={props.icon} size="large" />
        </div>
      </div>
    </SelectableBase>
  );
});
