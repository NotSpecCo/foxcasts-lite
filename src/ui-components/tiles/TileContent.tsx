import { h } from 'preact';
import { ComponentBaseProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import styles from './TileContent.module.css';

type Props = ComponentBaseProps & {
  backgroundImage?: string;
  contentH?: 'left' | 'center' | 'right';
  contentV?: 'top' | 'center' | 'bottom';
};

export function TileContent({
  contentH = 'right',
  contentV = 'bottom',
  ...props
}: Props): h.JSX.Element {
  return (
    <div
      className={joinClasses(styles.root)}
      style={
        props.backgroundImage
          ? { backgroundImage: `url(${props.backgroundImage})` }
          : {}
      }
    >
      <div
        className={joinClasses(
          styles.content,
          ifClass(!!props.backgroundImage, styles.scrim),
          styles[`${contentH}H`],
          styles[`${contentV}V`]
        )}
      >
        {props.children}
      </div>
    </div>
  );
}
