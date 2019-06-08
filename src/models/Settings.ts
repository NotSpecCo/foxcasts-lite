export type Settings = {
  theme: ThemeName;
  themePrimary: string;
  themeSecondary: string;
  episodeRowLayout: EpisodeRowLayout;
  navLayout: NavLayout;
};

export type ThemeName = 'dark' | 'light' | 'black';
export type EpisodeRowLayout = 'default' | 'compact';
export type NavLayout = 'side' | 'bottom';

type Methods = {
  updateSettings: (settings: Partial<Settings>) => void;
};

export type SettingsWithMethods = Settings & Methods;
