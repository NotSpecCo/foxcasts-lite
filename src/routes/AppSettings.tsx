import { h, VNode } from 'preact';
import { useState } from 'preact/hooks';
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
import { Input, RangeRow, Select, ToggleRow } from '../ui-components2/form';
import {
  View,
  ViewContent,
  ViewHeader,
  ViewTabs,
} from '../ui-components2/view';

export default function AppSettings(): VNode {
  const [tab, setTab] = useState<string>('display');
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
      <ViewTabs
        tabs={[
          { id: 'display', label: 'display' },
          { id: 'theme', label: 'theme' },
          { id: 'player', label: 'player' },
        ]}
        selectedId={tab}
        onChange={(tabId): void => setTab(tabId)}
      />
      {tab === 'display' ? (
        <ViewContent>
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
            label="App Bar Size"
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
        </ViewContent>
      ) : null}
      {tab === 'theme' ? (
        <ViewContent>
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
            size={6}
            selectable={{
              id: 'accentColor',
              selected: selectedId === 'accentColor',
            }}
            onEnter={(value): void => handleSettingSelect('accentColor', value)}
          />
          <ToggleRow
            label="App Bar Accent"
            value={settings.appBarAccent}
            selectable={{
              id: 'appBarAccent',
              selected: selectedId === 'appBarAccent',
            }}
            onChange={(value): void =>
              handleSettingSelect('appBarAccent', value)
            }
          />
          <ToggleRow
            label="Dynamic Colors"
            value={settings.dynamicThemeColor}
            selectable={{
              id: 'dynamicThemeColor',
              selected: selectedId === 'dynamicThemeColor',
            }}
            onChange={(value): void =>
              handleSettingSelect('dynamicThemeColor', value)
            }
          />
          <ToggleRow
            label="Dynamic Background"
            value={settings.dynamicBackgrounds}
            selectable={{
              id: 'dynamicBackgrounds',
              selected: selectedId === 'dynamicBackgrounds',
            }}
            onChange={(value): void =>
              handleSettingSelect('dynamicBackgrounds', value)
            }
          />
        </ViewContent>
      ) : null}
      {tab === 'player' ? (
        <ViewContent>
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
            onChange={(id): void =>
              handleSettingSelect('notificationAction', id)
            }
          />
          <RangeRow
            label="Skip Back"
            value={settings.playbackSkipBack}
            valueLabel="seconds"
            min={1}
            max={300}
            increment={1}
            selectable={{
              id: 'playbackSkipBack',
              selected: selectedId === 'playbackSkipBack',
            }}
            onChange={(value): void =>
              handleSettingSelect('playbackSkipBack', value)
            }
          />
          <RangeRow
            label="Skip Forward"
            value={settings.playbackSkipForward}
            valueLabel="seconds"
            min={1}
            max={300}
            increment={1}
            selectable={{
              id: 'playbackSkipForward',
              selected: selectedId === 'playbackSkipForward',
            }}
            onChange={(value): void =>
              handleSettingSelect('playbackSkipForward', value)
            }
          />
          <RangeRow
            label="Playback Speed"
            value={settings.playbackSpeed}
            valueLabel="x"
            min={0.5}
            max={4}
            increment={0.1}
            selectable={{
              id: 'playbackSpeed',
              selected: selectedId === 'playbackSpeed',
            }}
            onChange={(value): void =>
              handleSettingSelect('playbackSpeed', value)
            }
          />
          <ToggleRow
            label="Auto Delete Download"
            value={settings.autoDeleteDownload}
            disabled={true}
            selectable={{
              id: 'autoDeleteDownload',
              selected: selectedId === 'autoDeleteDownload',
            }}
            onChange={(value): void =>
              handleSettingSelect('autoDeleteDownload', value)
            }
          />
        </ViewContent>
      ) : null}
      <AppBar />
    </View>
  );
}
