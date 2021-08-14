import { Theme } from "./models/Settings";

export type ThemeValue = {
    variable: string;
    value: string;
};
  
export type ThemeConfig = {
    id: Theme;
    values: {
        [key: string]: ThemeValue;
        appBgColor: ThemeValue;
        appAccentColor: ThemeValue;
        primaryTextColor: ThemeValue;
        secondaryTextColor: ThemeValue;
        accentTextColor: ThemeValue;
        dividerColor: ThemeValue;
        highlightBgColor: ThemeValue;
        highlightTextColor: ThemeValue;
        headerBgColor: ThemeValue;
        headerTextColor: ThemeValue;
        menuBgColor: ThemeValue;
        menuTextColor: ThemeValue;
        menubarBgColor: ThemeValue;
        menubarTextColor: ThemeValue;
        inputBorderColor: ThemeValue;
    };
};

export const themes: ThemeConfig[] = [
{
    id: Theme.Light,
    values: {
        appBgColor: { variable: 'app-bg-color', value: '#ffffff' },
        appAccentColor: { variable: 'app-accent-color', value: '#ec5817' },
        primaryTextColor: { variable: 'primary-text-color', value: 'rgba(0, 0, 0, 0.88)' },
        secondaryTextColor: { variable: 'secondary-text-color', value: 'rgba(0, 0, 0, 0.5)' },
        accentTextColor: { variable: 'accent-text-color', value: '#ec5817' },
        dividerColor: { variable: 'divider-color', value: 'rgba(0, 0, 0, 0.1)' },
        highlightBgColor: { variable: 'highlight-bg-color', value: '#ec5817' },
        highlightTextColor: { variable: 'highlight-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        headerBgColor: { variable: 'header-bg-color', value: '#ec5817' },
        headerTextColor: { variable: 'header-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        menuBgColor: { variable: 'menu-bg-color', value: '#ffffff' },
        menuTextColor: { variable: 'menu-text-color', value: 'rgba(0, 0, 0, 0.88)' },
        menubarBgColor: { variable: 'menubar-bg-color', value: '#000000' },
        menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        inputBorderColor: { variable: 'input-border-color', value: '#aaaaaa' },
    }
},
{
    id: Theme.Dark,
    values: {
        appBgColor: { variable: 'app-bg-color', value: '#211c1e' },
        appAccentColor: { variable: 'app-accent-color', value: '#d04a11' },
        primaryTextColor: { variable: 'primary-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        secondaryTextColor: { variable: 'secondary-text-color', value: 'rgba(255, 255, 255, 0.5)' },
        accentTextColor: { variable: 'accent-text-color', value: '#d04a11' },
        dividerColor: { variable: 'divider-color', value: 'rgba(255, 255, 255, 0.1)' },
        highlightBgColor: { variable: 'highlight-bg-color', value: '#d04a11' },
        highlightTextColor: { variable: 'highlight-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        headerBgColor: { variable: 'header-bg-color', value: '#d04a11' },
        headerTextColor: { variable: 'header-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        menuBgColor: { variable: 'menu-bg-color', value: '#211c1e' },
        menuTextColor: { variable: 'menu-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        menubarBgColor: { variable: 'menubar-bg-color', value: '#000000' },
        menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        inputBorderColor: { variable: 'input-border-color', value: '#aaaaaa' },
    }
},
{
    id: Theme.Cobalt,
    values: {
        appBgColor: { variable: 'app-bg-color', value: 'rgb(15,53,75)' },
        appAccentColor: { variable: 'app-accent-color', value: '#ffc600' },
        primaryTextColor: { variable: 'primary-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        secondaryTextColor: { variable: 'secondary-text-color', value: 'rgba(255, 255, 255, 0.5)' },
        accentTextColor: { variable: 'accent-text-color', value: '#ffc600' },
        dividerColor: { variable: 'divider-color', value: 'rgba(255, 255, 255, 0.1)' },
        highlightBgColor: { variable: 'highlight-bg-color', value: '#ffc600' },
        highlightTextColor: { variable: 'highlight-text-color', value: 'rgba(0, 0, 0, 0.88)' },
        headerBgColor: { variable: 'header-bg-color', value: 'rgb(17,35,46)'},
        headerTextColor: { variable: 'header-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        menuBgColor: { variable: 'menu-bg-color', value: 'rgb(15,53,75)' },
        menuTextColor: { variable: 'menu-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        menubarBgColor: { variable: 'menubar-bg-color', value: 'rgb(17,35,46)' },
        menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        inputBorderColor: { variable: 'input-border-color', value: 'rgba(255, 255, 255, 0.1)' },
    }
},
// {
//   id: Theme.Dark,
//   appBgColor: { variable: 'app-bg-color', value: '' },
//   appAccentColor: { variable: 'app-accent-color', value: '' },
//   primaryTextColor: { variable: 'primary-text-color', value: '' },
//   secondaryTextColor: { variable: 'secondary-text-color', value: '' },
//   accentTextColor: { variable: 'accent-text-color', value: '' },
//   dividerColor: { variable: 'divider-color', value: '' },
//   highlightBgColor: { variable: 'highlight-bg-color', value: '' },
//   highlightTextColor: { variable: 'highlight-text-color', value: '' },
//   headerBgColor: { variable: 'header-bg-color', value: '' },
//   headerTextColor: { variable: 'header-text-color', value: '' },
//   menuBgColor: { variable: 'menu-bg-color', value: '' },
//   menuTextColor: { variable: 'menu-text-color', value: '' },
//   menubarBgColor: { variable: 'menubar-bg-color', value: '' },
//   menubarTextColor: { variable: 'menubar-text-color', value: '' },
//   inputBorderColor: { variable: 'input-border-color', value: '' },
// },
];