import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import { SelectableBase } from '../hoc';
import styles from './Tile.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    width?: 1 | 2 | 3;
    accentColor?: string;
    frontContent?: h.JSX.Element;
    backContent: h.JSX.Element;
  };

export function Tile({ width = 1, ...props }: Props): h.JSX.Element {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 500);
  }, []);
  return (
    <SelectableBase
      {...props.selectable}
      className={joinClasses(styles.root, styles[`width${width}`])}
      style={{ gridColumn: `auto / span ${width}` }}
    >
      <div
        className={joinClasses(
          styles.content,
          ifClass(animate, styles.animateUnflip)
        )}
      >
        <div
          className={styles.back}
          style={{
            backgroundColor: props.accentColor || 'var(--app-accent-color)',
          }}
        >
          {props.backContent}
        </div>
        <div
          className={styles.front}
          style={{
            backgroundColor: props.accentColor || 'var(--app-accent-color)',
          }}
        >
          {props.frontContent}
        </div>
      </div>
    </SelectableBase>
  );
}
