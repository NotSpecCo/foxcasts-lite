import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ComponentBaseProps } from '../models';
import { joinClasses } from '../utils/classes';
import style from './ProgressBar.module.css';

type ProgressBarProps = ComponentBaseProps & {
  position: number;
};

export default function ProgressBar({
  position,
  ...props
}: ProgressBarProps): VNode {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let newWidth = position;
    if (position < 0) {
      newWidth = 0;
    }
    if (position > 100) {
      newWidth = 100;
    }

    setWidth(newWidth);
  }, [position]);

  return (
    <div className={joinClasses(style.root, props.className)}>
      <div className={style.bar} style={{ width: `${width}%` }} />
    </div>
  );
}
