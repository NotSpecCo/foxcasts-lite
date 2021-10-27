import { Theme } from "./models/Settings";

export type ThemeValue = {
    variable: string;
    value: string;
};
  
export type ThemeConfig = {
    id: Theme;
    settings: {
        accentHeader: boolean;
        accentHighlight: boolean;
        accentText: boolean;
    };
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
    settings: {
        accentHeader: true,
        accentHighlight: true,
        accentText: true,
    },
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
        menubarBgColor: { variable: 'menubar-bg-color', value: '#eaeaea' },
        menubarBarColor: { variable: 'menubar-bar-color', value: '#eaeaea' },
        menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(0, 0, 0, 0.88)' },
        inputBorderColor: { variable: 'input-border-color', value: '#aaaaaa' },
        scrimColor: { variable: 'scrim-color', value: 'rgba(255, 255, 255, .7' },
    }
},
{
    id: Theme.Dark,
    settings: {
        accentHeader: false,
        accentHighlight: false,
        accentText: true,
    },
    values: {
        appBgColor: { variable: 'app-bg-color', value: '#000000' },
        appAccentColor: { variable: 'app-accent-color', value: '#ec5817' },
        primaryTextColor: { variable: 'primary-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        secondaryTextColor: { variable: 'secondary-text-color', value: 'rgba(255, 255, 255, 0.5)' },
        accentTextColor: { variable: 'accent-text-color', value: '#ec5817' },
        dividerColor: { variable: 'divider-color', value: 'rgba(255, 255, 255, 0.1)' },
        highlightBgColor: { variable: 'highlight-bg-color', value: '#ec5817' },
        highlightTextColor: { variable: 'highlight-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        headerBgColor: { variable: 'header-bg-color', value: '#000000' },
        headerTextColor: { variable: 'header-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        menuBgColor: { variable: 'menu-bg-color', value: '#000000' },
        menuTextColor: { variable: 'menu-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        menubarBgColor: { variable: 'menubar-bg-color', value: '#242424' },
        menubarBarColor: { variable: 'menubar-bar-color', value: '#242424' },
        menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(255, 255, 255, 0.88)' },
        inputBorderColor: { variable: 'input-border-color', value: '#aaaaaa' },
        scrimColor: { variable: 'scrim-color', value: 'rgba(0, 0, 0, .7' },
    }
},
// {
//     id: Theme.Dark,
//     settings: {
//         accentHeader: false,
//         accentHighlight: true,
//         accentText: true,
//     },
//     values: {
//         appBgColor: { variable: 'app-bg-color', value: '#000000' },
//         appAccentColor: { variable: 'app-accent-color', value: '#ec5817' },
//         primaryTextColor: { variable: 'primary-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         secondaryTextColor: { variable: 'secondary-text-color', value: 'rgba(255, 255, 255, 0.5)' },
//         accentTextColor: { variable: 'accent-text-color', value: '#ec5817' },
//         dividerColor: { variable: 'divider-color', value: 'rgba(255, 255, 255, 0.1)' },
//         highlightBgColor: { variable: 'highlight-bg-color', value: '#ec5817' },
//         highlightTextColor: { variable: 'highlight-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         headerBgColor: { variable: 'header-bg-color', value: '#000000' },
//         headerTextColor: { variable: 'header-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         menuBgColor: { variable: 'menu-bg-color', value: '#000000' },
//         menuTextColor: { variable: 'menu-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         menubarBgColor: { variable: 'menubar-bg-color', value: '#181818' },
//         menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         inputBorderColor: { variable: 'input-border-color', value: '#aaaaaa' },
//     }
// },
// {
//     id: Theme.Simple,
//     settings: {
//         accentHeader: true,
//         accentHighlight: true,
//         accentText: true,
//     },
//     values: {
//         appBgColor: { variable: 'app-bg-color', value: '#ffffff' },
//         appAccentColor: { variable: 'app-accent-color', value: '#B7B6C1' },
//         primaryTextColor: { variable: 'primary-text-color', value: 'rgba(0, 0, 0, 0.88)' },
//         secondaryTextColor: { variable: 'secondary-text-color', value: 'rgba(0, 0, 0, 0.5)' },
//         accentTextColor: { variable: 'accent-text-color', value: '#B7B6C1' },
//         dividerColor: { variable: 'divider-color', value: 'rgba(0, 0, 0, 0.1)' },
//         highlightBgColor: { variable: 'highlight-bg-color', value: '#D3D3D9' },
//         highlightTextColor: { variable: 'highlight-text-color', value: 'rgba(0, 0, 0, 0.88)' },
//         headerBgColor: { variable: 'header-bg-color', value: '#000000' },
//         headerTextColor: { variable: 'header-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         menuBgColor: { variable: 'menu-bg-color', value: '#ffffff' },
//         menuTextColor: { variable: 'menu-text-color', value: 'rgba(0, 0, 0, 0.88)' },
//         menubarBgColor: { variable: 'menubar-bg-color', value: '#000000' },
//         menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         inputBorderColor: { variable: 'input-border-color', value: '#aaaaaa' },
//     }
// },
// {
//     id: Theme.Cobalt,
//     settings: {
//         accentHeader: false,
//         accentHighlight: true,
//         accentText: true,
//     },
//     values: {
//         appBgColor: { variable: 'app-bg-color', value: '#0f354b' },
//         appAccentColor: { variable: 'app-accent-color', value: '#ffc600' },
//         primaryTextColor: { variable: 'primary-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         secondaryTextColor: { variable: 'secondary-text-color', value: 'rgba(255, 255, 255, 0.5)' },
//         accentTextColor: { variable: 'accent-text-color', value: '#ffc600' },
//         dividerColor: { variable: 'divider-color', value: 'rgba(255, 255, 255, 0.1)' },
//         highlightBgColor: { variable: 'highlight-bg-color', value: '#ffc600' },
//         highlightTextColor: { variable: 'highlight-text-color', value: 'rgba(0, 0, 0, 0.88)' },
//         headerBgColor: { variable: 'header-bg-color', value: '#11232e'},
//         headerTextColor: { variable: 'header-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         menuBgColor: { variable: 'menu-bg-color', value: '#0f354b' },
//         menuTextColor: { variable: 'menu-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         menubarBgColor: { variable: 'menubar-bg-color', value: '#11232e' },
//         menubarTextColor: { variable: 'menubar-text-color', value: 'rgba(255, 255, 255, 0.88)' },
//         inputBorderColor: { variable: 'input-border-color', value: 'rgba(255, 255, 255, 0.1)' },
//     }
// },
];