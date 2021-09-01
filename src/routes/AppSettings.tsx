import { h, VNode } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { useSettings } from '../contexts/SettingsProvider';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { DisplayDensity, Settings, Theme } from '../models';
import { ThemeConfig, themes } from '../themes';
import { Menu, MenuOption, View } from '../ui-components';
import { SelectableRow } from '../ui-components/SelectableRow';
import styles from './AppSettings.module.css';

type SelectMenu = {
  settingsKey: keyof Settings;
  title: string;
  options: MenuOption[];
};

export default function AppSettings(): VNode {
  const { settings, setSettings } = useSettings();
  const [selectMenu, setSelectMenu] = useState<SelectMenu>();
  const accentColorRef = useRef<HTMLInputElement>(null);

  function saveSetting(key: keyof Settings, value: any): void {
    setSettings({
      ...settings,
      [key]: value,
    });
  }

  function handleClick(id: string): void {
    switch (id) {
      case 'theme':
        setSelectMenu({
          settingsKey: 'theme',
          title: 'Theme',
          options: [
            { id: Theme.Light, label: 'Light' },
            { id: Theme.Dark, label: 'Dark' },
            { id: Theme.Cobalt, label: 'Cobalt' },
            { id: Theme.Simple, label: 'Simple' },
          ],
        });
        break;
      case 'displayDensity':
        setSelectMenu({
          settingsKey: 'displayDensity',
          title: 'Display Density',
          options: [
            { id: DisplayDensity.Normal, label: 'Normal' },
            { id: DisplayDensity.Compact, label: 'Compact' },
          ],
        });
        break;
      case 'podcastsLayout':
        setSelectMenu({
          settingsKey: 'podcastsLayout',
          title: 'Podcasts Layout',
          options: [
            { id: 'list', label: 'List' },
            { id: 'grid', label: 'Grid' },
          ],
        });
        break;
      case 'accentColor':
        saveSetting('accentColor', accentColorRef.current?.value);
        break;
    }
  }

  useDpad({
    priority: SelectablePriority.Low,
    onEnter: handleClick,
    onChange: (itemId) => {
      if (itemId === 'accentColor') {
        accentColorRef.current?.focus();
      } else {
        accentColorRef.current?.blur();
      }
    },
  });

  function handleSettingSelect(key: keyof Settings, value: string): void {
    if (key === 'theme') {
      // We want to use the theme's original accent color
      const theme = themes.find((a) => a.id === value) as ThemeConfig;
      setSettings({
        ...settings,
        theme: value as Theme,
        accentColor: theme.values.appAccentColor.value.slice(1),
      });
    } else {
      saveSetting(key, value);
    }

    setSelectMenu(undefined);
  }

  return (
    <View headerText="Settings">
      <div className={styles.container}>
        <div className={styles.heading}>Appearance</div>
        <SelectableRow selectableId="displayDensity">
          Display Density
          <span className={styles.selectValue}>{settings.displayDensity}</span>
        </SelectableRow>
        <SelectableRow selectableId="podcastsLayout">
          Podcasts Layout
          <span className={styles.selectValue}>{settings.podcastsLayout}</span>
        </SelectableRow>
        <SelectableRow selectableId="theme">
          Theme
          <span className={styles.selectValue}>{settings.theme}</span>
        </SelectableRow>
        <SelectableRow selectableId="accentColor">
          Accent Color
          <input
            ref={accentColorRef}
            type="text"
            value={settings.accentColor}
            size={6}
            maxLength={6}
          />
        </SelectableRow>
      </div>
      {selectMenu ? (
        <Menu
          title={selectMenu.title}
          options={selectMenu.options}
          closeSide="right"
          onSelect={(id): void =>
            handleSettingSelect(selectMenu.settingsKey, id)
          }
          onClose={(): void => setSelectMenu(undefined)}
        />
      ) : null}
    </View>
  );
}