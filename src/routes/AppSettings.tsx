import { h, VNode } from 'preact';
import { useSettings } from '../contexts/SettingsProvider';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { Settings } from '../models';
import { MenuOption, View } from '../ui-components';
import styles from './AppSettings.module.css';

type SettingItem = {
  key: keyof Settings;
  label: string;
  type: 'checkbox' | 'input' | 'select';
  options?: MenuOption[];
  value: boolean | string;
};

export default function AppSettings(): VNode {
  const { settings, setSettings } = useSettings();

  function saveSetting(key: keyof Settings, value: any): void {
    setSettings({
      ...settings,
      [key]: value,
    });
  }

  function handleClick(id: string): void {
    switch (id) {
      case 'darkTheme':
      case 'compactLayout':
        saveSetting(id, !settings[id]);
    }
  }

  useDpad({
    priority: SelectablePriority.Low,
    onEnter: handleClick,
  });

  return (
    <View headerText="Settings">
      <div className={styles.container}>
        <div
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id="darkTheme"
          className={styles.row}
        >
          Dark Theme
          <input type="checkbox" checked={settings.darkTheme} />
        </div>
        <div
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id="compactLayout"
          className={styles.row}
        >
          Compact Layout
          <input type="checkbox" checked={settings.compactLayout} />
        </div>
      </div>
    </View>
  );
}
