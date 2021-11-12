import { createContext, h, VNode } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import {
  AppBarSize,
  ComponentBaseProps,
  ListLayout,
  NotificationAction,
  NotificationType,
  PlayerLayout,
  Settings,
  TextSize,
  Theme,
} from '../models';
import {
  getStorageItem,
  setStorageItem,
  StorageKey,
} from '../services/storage';

const defaultSettings: Settings = {
  theme: Theme.Dark,
  accentColor: 'ec5817',
  appBarAccent: true,
  dynamicThemeColor: true,
  dynamicBackgrounds: false,

  podcastsLayout: ListLayout.Grid,
  homeMenuLayout: ListLayout.Grid,
  appBarSize: AppBarSize.Normal,
  textSize: TextSize.Medium,

  playerLayout: PlayerLayout.Fancy,
  notificationType: NotificationType.EpisodeInfo,
  notificationAction: NotificationAction.ViewPlayer,
  playbackSpeed: 1,
  playbackSkipBack: 10,
  playbackSkipForward: 30,
  autoDeleteDownload: false,

  podcastSettings: {},
};

type SettingsContextValue = {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  setSetting: <T extends keyof Settings>(
    settingsKey: keyof Settings,
    val: Settings[T]
  ) => void;
};

const defaultValue: SettingsContextValue = {
  settings: defaultSettings,
  setSettings: (settings) => {
    console.log('default', settings);
  },
  setSetting: (settingsKey) => {
    console.log('default', settingsKey);
  },
};

const SettingsContext = createContext<SettingsContextValue>(defaultValue);

type SettingsProviderProps = ComponentBaseProps;

export function SettingsProvider(props: SettingsProviderProps): VNode {
  const [settings, setSettingsInternal] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const result = getStorageItem<Settings>(StorageKey.Settings);
    setSettingsInternal({ ...defaultSettings, ...result });
  }, []);

  function setSettings(val: Settings): void {
    setStorageItem<Settings>(StorageKey.Settings, val);
    setSettingsInternal(val);
  }

  function setSetting<T extends keyof Settings>(
    key: T,
    val: Settings[T]
  ): void {
    setSettings({
      ...settings,
      [key]: val,
    });
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        setSetting,
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
