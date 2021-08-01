import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './ProgressBar.module.css';

interface ProgressBarProps {
  position: number;
}

export default function ProgressBar({ position }: ProgressBarProps): any {
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
    <div className={style.root}>
      <div className={style.bar} style={{ width: `${width}%` }} />
    </div>
  );
}
