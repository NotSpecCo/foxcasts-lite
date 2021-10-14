import { h, createContext, VNode } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import {
  ComponentBaseProps,
  DisplayDensity,
  NotificationAction,
  NotificationType,
  PodcastsLayout,
  Settings,
  Theme,
} from '../models';
import {
  getStorageItem,
  setStorageItem,
  StorageKey,
} from '../services/storage';

const defaultSettings: Settings = {
  displayDensity: DisplayDensity.Compact,
  podcastsLayout: PodcastsLayout.Grid,
  fullScreen: false,
  theme: Theme.Light,
  accentColor: 'ec5817',
  notificationType: NotificationType.EpisodeInfo,
  notificationAction: NotificationAction.ViewPlayer,
};

type SettingsContextValue = {
  settings: Settings;
  setSettings: (settings: Settings) => void;
};

const defaultValue: SettingsContextValue = {
  settings: defaultSettings,
  setSettings: (settings) => {
    console.log('default', settings);
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
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
