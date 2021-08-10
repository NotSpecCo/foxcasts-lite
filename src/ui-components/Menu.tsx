import { h } from 'preact';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { useNavKeys } from '../hooks/useNavKeys';
import { ComponentBaseProps } from '../models';
import { ifClass, joinClasses } from '../utils/classes';
import styles from './Menu.module.css';
import { MenuBar } from './MenuBar';

export type MenuOption = {
  id: string;
  label: string;
  disabled?: boolean;
};
type Props = ComponentBaseProps & {
  options: MenuOption[];
  title?: string;
  closeSide?: 'left' | 'right';
  onSelect: (menuOptionId: string) => void;
  onClose: () => void;
};

export function Menu({
  closeSide = 'left',
  options = [],
  ...props
}: Props): any {
  useDpad({
    priority: SelectablePriority.Medium,
    onEnter: (itemId) => {
      props.onSelect(itemId);
      // props.onClose();
    },
  });

  useNavKeys(
    {
      SoftLeft: () => closeSide === 'left' && props.onClose(),
      SoftRight: () => closeSide === 'right' && props.onClose(),
    },
    { stopPropagation: true, capture: true }
  );

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {props.title ? <div className={styles.title}>{props.title}</div> : null}
        {options.map((option, i) => (
          <div
            key={option.id}
            className={joinClasses(
              styles.option,
              ifClass(!!option.disabled, styles.disabled)
            )}
            data-selectable-priority={SelectablePriority.Medium}
            data-selectable-id={option.id}
          >
            <div className={styles.shortcut}>{i + 1}</div>
            {option.label}
          </div>
        ))}
      </div>
      <MenuBar
        leftText={closeSide === 'left' ? 'Close' : ''}
        centerText="Select"
        rightText={closeSide === 'right' ? 'Close' : ''}
      />
    </div>
  );
}
