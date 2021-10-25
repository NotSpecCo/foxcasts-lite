import { h, VNode } from 'preact';
import { Palette } from 'foxcasts-core/lib/types';
import { joinClasses } from '../../utils/classes';
import { ComponentBaseProps } from '../../models';
import { ViewProvider } from '../../contexts/ViewProvider';
import styles from './View.module.css';
import { useSettings } from '../../contexts/SettingsProvider';

type Props = ComponentBaseProps & {
  backgroundImageUrl?: string;
  backgroundShift?: number;
  palette?: Palette;
  accentColor?: string;
  id?: number;
  enableCustomColor?: boolean;
};

export function ViewBase(props: Props): VNode {
  const { settings } = useSettings();

  function getAccentColor(): string {
    return settings.dynamicThemeColor && props.accentColor
      ? props.accentColor
      : 'inherit';
  }

  return (
    <ViewProvider>
      <div
        className={joinClasses(styles.root)}
        style={{
          backgroundImage:
            settings.dynamicBackgrounds && props.backgroundImageUrl
              ? `url(${props.backgroundImageUrl})`
              : 'none',
          backgroundPositionX:
            props.backgroundShift !== undefined
              ? `${props.backgroundShift}%`
              : '50%',
          backgroundPositionY: 'top',
          '--app-accent-color': getAccentColor(),
          '--accent-text-color': getAccentColor(),
          '--highlight-bg-color': getAccentColor(),
          '--menubar-bar-color': getAccentColor(),
        }}
      >
        <div className={styles.backdrop}>{props.children}</div>
      </div>
    </ViewProvider>
  );
}

export const View = (props: Props): h.JSX.Element => (
  <ViewProvider>
    <ViewBase {...props} />
  </ViewProvider>
);
