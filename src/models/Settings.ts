export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Cobalt = 'cobalt',
  Simple = 'simple',
}

export enum PodcastsLayout {
  List = 'list',
  Grid = 'grid',
}

export enum DisplayDensity {
  Normal = 'normal',
  Compact = 'compact',
}

export enum NotificationType {
  None = 'none',
  EpisodeInfo = 'episodeInfo',
}

export enum NotificationAction {
  ViewPlayer = 'viewPlayer',
  PlayPause = 'playpause',
}

export type Settings = {
  displayDensity: DisplayDensity;
  podcastsLayout: PodcastsLayout;
  fullScreen: boolean;
  theme: Theme;
  accentColor: string;
  notificationType: NotificationType;
  notificationAction: NotificationAction;
  playbackSpeed: number;
};
