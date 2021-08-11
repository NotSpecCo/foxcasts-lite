import { h, VNode } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { useSettings } from '../contexts/SettingsProvider';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { DisplayDensity, Settings, Theme } from '../models';
import { ThemeConfig, themes } from '../themes';
import { Menu, MenuOption, View } from '../ui-components';
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
        console.log('accent', accentColorRef.current?.value);
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
        <div
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id="displayDensity"
          className={styles.row}
        >
          Display Density
          <select value={settings.displayDensity}>
            <option value={DisplayDensity.Normal}>Normal</option>
            <option value={DisplayDensity.Compact}>Compact</option>
          </select>
        </div>
        <div
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id="podcastsLayout"
          className={styles.row}
        >
          Podcasts Layout
          <select value={settings.podcastsLayout}>
            <option value="list">List</option>
            <option value="grid">Grid</option>
          </select>
        </div>
        <div
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id="theme"
          className={styles.row}
        >
          Theme
          <select value={settings.theme}>
            <option value={Theme.Light}>Light</option>
            <option value={Theme.Dark}>Dark</option>
          </select>
        </div>
        <div
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id="accentColor"
          className={styles.row}
        >
          Accent Color
          <input
            ref={accentColorRef}
            type="text"
            value={settings.accentColor}
            size={7}
          />
        </div>
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
