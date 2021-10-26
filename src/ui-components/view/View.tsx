import { h, VNode } from 'preact';
import { Palette } from 'foxcasts-core/lib/types';
import { ifClass, joinClasses } from '../../utils/classes';
import { ComponentBaseProps } from '../../models';
import styles from './View.module.css';
import { useSettings } from '../../contexts/SettingsProvider';

type Props = ComponentBaseProps & {
  backgroundImageUrl?: string;
  backgroundShift?: number;
  palette?: Palette;
  accentColor?: string;
  enableBackdrop?: boolean;
  id?: number;
  enableCustomColor?: boolean;
};

export function View({ enableBackdrop = true, ...props }: Props): VNode {
  const { settings } = useSettings();

  function getAccentColor(): string {
    return settings.dynamicThemeColor && props.accentColor
      ? props.accentColor
      : 'inherit';
  }

  return (
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
      <div
        className={joinClasses(
          styles.backdrop,
          ifClass(enableBackdrop, styles.scrim)
        )}
      >
        {props.children}
      </div>
    </div>
  );
}
