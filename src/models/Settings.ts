export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum ListLayout {
  List = 'list',
  Grid = 'grid',
}

export enum TextSize {
  Smallest = 'smallest',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Largest = 'largest',
}

export enum AppBarSize {
  Hidden = 'hidden',
  Compact = 'compact',
  Normal = 'normal',
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
  theme: Theme;
  accentColor: string;

  podcastsLayout: ListLayout;
  homeMenuLayout: ListLayout;
  textSize: TextSize;
  appBarSize: AppBarSize;

  notificationType: NotificationType;
  notificationAction: NotificationAction;
  playbackSpeed: number;
};
