import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useSettings } from '../contexts/SettingsProvider';
import { useDpad } from '../hooks/useDpad';
import { Settings } from '../models';
import { View } from '../ui-components';
import { ifClass, joinClasses } from '../utils/classes';
import { NavItem, wrapItems } from '../utils/navigation';
import styles from './AppSettings.module.css';

type SettingItem = {
  key: keyof Settings;
  label: string;
  value: boolean;
};

export default function AppSettings(): VNode {
  const [items, setItems] = useState<NavItem<SettingItem>[]>([]);

  const { settings, setSettings } = useSettings();

  useEffect(() => {
    const settingsList: SettingItem[] = [
      { key: 'darkTheme', label: 'Dark Theme', value: settings['darkTheme'] },
      {
        key: 'compactLayout',
        label: 'Compact Layout',
        value: settings['compactLayout'],
      },
    ];
    setItems(wrapItems(settingsList, 'key'));
  }, []);

  useDpad({
    items,
    onEnter: (item) => {
      const newSettings = {
        ...settings,
        [item.data.key]: !item.data.value,
      };
      setSettings(newSettings);

      setItems(
        items.map((a) => ({
          ...a,
          data: {
            ...a.data,
            value: newSettings[a.data.key],
          },
        }))
      );
    },
    onChange: (items) => setItems(items),
    options: { stopPropagation: true },
  });

  return (
    <View headerText="Settings">
      {items.map((item) => (
        <div
          key={item.id}
          ref={item.ref}
          className={joinClasses(
            styles.row,
            ifClass(item.isSelected, styles.selected)
          )}
        >
          {item.data.label}
          <input type="checkbox" checked={item.data.value} />
        </div>
      ))}
    </View>
  );
}
