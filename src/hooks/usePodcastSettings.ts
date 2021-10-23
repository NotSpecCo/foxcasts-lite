import { Palette } from 'foxcasts-core/lib/types';
import { useSettings } from '../contexts/SettingsProvider';
import { PodcastSettings } from '../models';

const defaultSettings: PodcastSettings = {
  accentColor: 'vibrant',
};

type Return = {
  settings: {
    accentColor: keyof Palette;
  };
  setSetting: (id: string, value: string) => void;
};

export function usePodcastSettings(podcastId?: number | string | null): Return {
  const appSettings = useSettings();

  const settings = podcastId
    ? {
        ...defaultSettings,
        ...appSettings.settings.podcastSettings[Number(podcastId)],
      }
    : { ...defaultSettings };

  function setSetting(id: string, value: string): void {
    if (!podcastId) return;

    const podcastSettings = {
      ...appSettings.settings.podcastSettings,
      [podcastId]: {
        ...settings,
        [id]: value,
      },
    };

    appSettings.setSetting('podcastSettings', podcastSettings);
  }

  return { settings, setSetting };
}
