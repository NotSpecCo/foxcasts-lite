import { h, VNode } from 'preact';
import { useSettings } from '../contexts/SettingsProvider';
import { SelectablePriority } from '../hooks/useDpad';
import { useListNav } from '../hooks/useListNav';
import {
  AppBarSize,
  ListLayout,
  NotificationAction,
  NotificationType,
  Settings,
  TextSize,
  Theme,
} from '../models';
import { ThemeConfig, themes } from '../themes';
import { AppBar } from '../ui-components2/appbar';
import { Input, Select } from '../ui-components2/form';
import { Typography } from '../ui-components2/Typography';
import { View, ViewContent, ViewHeader } from '../ui-components2/view';

export default function AppSettings(): VNode {
  const { settings, setSettings, setSetting } = useSettings();

  const { selectedId } = useListNav({
    priority: SelectablePriority.Low,
    updateRouteOnChange: false,
  });

  function handleSettingSelect<T extends keyof Settings>(
    key: T,
    value: Settings[T]
  ): void {
    if (key === 'theme') {
      // We want to use the theme's original accent color
      const theme = themes.find((a) => a.id === value) as ThemeConfig;
      setSettings({
        ...settings,
        theme: value as Theme,
        accentColor: theme.values.appAccentColor.value.slice(1),
      });
    } else {
      setSetting(key, value);
    }
  }

  return (
    <View>
      <ViewHeader>Settings</ViewHeader>
      <ViewContent>
        <Typography type="titleSmall">Display</Typography>
        <Select
          label="Podcasts Layout"
          value={settings.podcastsLayout}
          options={[
            { id: ListLayout.List, label: 'List' },
            { id: ListLayout.Grid, label: 'Grid' },
          ]}
          selectable={{
            id: 'podcastsLayout',
            selected: selectedId === 'podcastsLayout',
          }}
          onChange={(id): void => handleSettingSelect('podcastsLayout', id)}
        />
        <Select
          label="Home Menu Layout"
          value={settings.homeMenuLayout}
          options={[
            { id: ListLayout.List, label: 'List' },
            { id: ListLayout.Grid, label: 'Grid' },
          ]}
          selectable={{
            id: 'homeMenuLayout',
            selected: selectedId === 'homeMenuLayout',
          }}
          onChange={(id): void => handleSettingSelect('homeMenuLayout', id)}
        />
        <Select
          label="Text Size"
          value={settings.textSize}
          options={[
            { id: TextSize.Smallest, label: 'Smallest' },
            { id: TextSize.Small, label: 'Small' },
            { id: TextSize.Medium, label: 'Medium' },
            { id: TextSize.Large, label: 'Large' },
            { id: TextSize.Largest, label: 'Largest' },
          ]}
          selectable={{
            id: 'textSize',
            selected: selectedId === 'textSize',
          }}
          onChange={(id): void => handleSettingSelect('textSize', id)}
        />
        <Select
          label="App Bar Display"
          value={settings.appBarSize}
          options={[
            { id: AppBarSize.Hidden, label: 'Hidden' },
            { id: AppBarSize.Compact, label: 'Compact' },
            { id: AppBarSize.Normal, label: 'Normal' },
          ]}
          selectable={{
            id: 'appBarSize',
            selected: selectedId === 'appBarSize',
          }}
          onChange={(id): void => handleSettingSelect('appBarSize', id)}
        />
        <Typography type="titleSmall">Theme</Typography>
        <Select
          label="Base Theme"
          value={settings.theme}
          options={[
            { id: Theme.Light, label: 'Light' },
            { id: Theme.Dark, label: 'Dark' },
          ]}
          selectable={{
            id: 'theme',
            selected: selectedId === 'theme',
          }}
          onChange={(id): void => handleSettingSelect('theme', id)}
        />
        <Input
          label="Accent Color"
          value={settings.accentColor}
          selectable={{
            id: 'accentColor',
            selected: selectedId === 'accentColor',
          }}
          onChange={(value): void => handleSettingSelect('accentColor', value)}
        />
        <Typography type="titleSmall">Behavior</Typography>
        <Select
          label="Notification Type"
          value={settings.notificationType}
          options={[
            { id: NotificationType.None, label: 'None' },
            { id: NotificationType.EpisodeInfo, label: 'Episode Info' },
          ]}
          selectable={{
            id: 'notificationType',
            selected: selectedId === 'notificationType',
          }}
          onChange={(id): void => handleSettingSelect('notificationType', id)}
        />
        <Select
          label="Notification Action"
          value={settings.notificationAction}
          options={[
            { id: NotificationAction.ViewPlayer, label: 'View Player' },
            { id: NotificationAction.PlayPause, label: 'Play/Pause' },
          ]}
          selectable={{
            id: 'notificationAction',
            selected: selectedId === 'notificationAction',
          }}
          onChange={(id): void => handleSettingSelect('notificationAction', id)}
        />
      </ViewContent>
      <AppBar />
    </View>
  );
}
