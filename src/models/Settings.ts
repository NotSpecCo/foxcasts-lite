export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Cobalt = 'cobalt',
}

export enum PodcastsLayout {
  List = 'list',
  Grid = 'grid',
}

export enum DisplayDensity {
  Normal = 'normal',
  Compact = 'compact',
}

export type Settings = {
  displayDensity: DisplayDensity;
  podcastsLayout: PodcastsLayout;
  fullScreen: boolean;
  theme: Theme;
  accentColor: string;
  accentHeader: boolean;
  accentHighlight: boolean;
  accentText: boolean;
};
