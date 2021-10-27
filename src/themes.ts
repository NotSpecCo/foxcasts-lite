import { Theme } from './models/Settings';

export type ThemeConfig = {
  id: Theme;
  settings: {
    accentHeader: boolean;
    accentHighlight: boolean;
    accentText: boolean;
  };
  values: {
    [key: string]: string;
    appBgColor: string;
    appAccentColor: string;
    primaryTextColor: string;
    secondaryTextColor: string;
    accentTextColor: string;
    dividerColor: string;
    highlightBgColor: string;
    highlightTextColor: string;
    headerBgColor: string;
    headerTextColor: string;
    menuBgColor: string;
    menuTextColor: string;
    menubarBgColor: string;
    menubarBarColor: string;
    menubarTextColor: string;
    inputBorderColor: string;
    scrimColor: string;
  };
};

export const themes: ThemeConfig[] = [
  {
    id: Theme.Light,
    settings: {
      accentHeader: false,
      accentHighlight: true,
      accentText: true,
    },
    values: {
      appBgColor: '#ffffff',
      appAccentColor: '#ec5817',
      primaryTextColor: 'rgba(0, 0, 0, 0.88)',
      secondaryTextColor: 'rgba(0, 0, 0, 0.5)',
      accentTextColor: '#ec5817',
      dividerColor: 'rgba(0, 0, 0, 0.1)',
      highlightBgColor: '#ec5817',
      highlightTextColor: 'rgba(255, 255, 255, 0.88)',
      headerBgColor: '#ffffff',
      headerTextColor: 'rgba(255, 255, 255, 0.88)',
      menuBgColor: '#ffffff',
      menuTextColor: 'rgba(0, 0, 0, 0.88)',
      menubarBgColor: '#eaeaea',
      menubarBarColor: '#eaeaea',
      menubarTextColor: 'rgba(0, 0, 0, 0.88)',
      inputBorderColor: '#aaaaaa',
      scrimColor: 'rgba(255, 255, 255, .7',
    },
  },
  {
    id: Theme.Dark,
    settings: {
      accentHeader: false,
      accentHighlight: true,
      accentText: true,
    },
    values: {
      appBgColor: '#000000',
      appAccentColor: '#ec5817',
      primaryTextColor: 'rgba(255, 255, 255, 0.88)',
      secondaryTextColor: 'rgba(255, 255, 255, 0.5)',
      accentTextColor: '#ec5817',
      dividerColor: 'rgba(255, 255, 255, 0.1)',
      highlightBgColor: '#ec5817',
      highlightTextColor: 'rgba(255, 255, 255, 0.88)',
      headerBgColor: '#000000',
      headerTextColor: 'rgba(255, 255, 255, 0.88)',
      menuBgColor: '#000000',
      menuTextColor: 'rgba(255, 255, 255, 0.88)',
      menubarBgColor: '#242424',
      menubarBarColor: '#242424',
      menubarTextColor: 'rgba(255, 255, 255, 0.88)',
      inputBorderColor: '#aaaaaa',
      scrimColor: 'rgba(0, 0, 0, .7',
    },
  },
];
