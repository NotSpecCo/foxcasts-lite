import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import * as style from './style.css';

interface ProgressBarProps {
    position: number;
}

function ProgressBar({ position }: ProgressBarProps) {
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

export default ProgressBar;
