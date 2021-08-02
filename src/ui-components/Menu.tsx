import { h, options } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useDpad } from '../hooks/useDpad';
import { useNavKeys } from '../hooks/useNavKeys';
import { ComponentBaseProps } from '../models';
import { ifClass, joinClasses } from '../utils/classes';
import { NavItem, wrapItems } from '../utils/navigation';
import styles from './Menu.module.css';
import { MenuBar } from './MenuBar';

export type MenuOption = {
  id: string;
  label: string;
  disabled?: boolean;
};
type Props = ComponentBaseProps & {
  options: MenuOption[];
  closeSide?: 'left' | 'right';
  onSelect: (menuOptionId: string) => void;
  onClose: () => void;
};

export function Menu({ closeSide = 'left', ...props }: Props): any {
  const [items, setItems] = useState<NavItem<MenuOption>[]>([]);

  useEffect(() => {
    setItems(wrapItems(props.options));
  }, [props.options]);

  useDpad({
    items,
    onEnter: (item) => {
      props.onSelect(item.data.id);
      // props.onClose();
    },
    onChange: (items) => setItems(items),
    options: { stopPropagation: true, capture: true },
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
        {items.map((item) => (
          <div
            key={item.data.id}
            ref={item.ref}
            className={joinClasses(
              styles.option,
              ifClass(item.isSelected, styles.selected),
              ifClass(!!item.data.disabled, styles.disabled)
            )}
          >
            {item.data.label}
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
