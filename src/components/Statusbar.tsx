import { format } from 'date-fns';
import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ComponentBaseProps } from '../models';
import { KaiOS } from '../services/kaios';
import styles from './Statusbar.module.css';

type StatusbarProps = ComponentBaseProps & {
  text?: string;
};

export default function Statusbar(props: StatusbarProps): VNode {
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState(0);
  const [connection, setConnection] = useState<'wifi' | 'cellular' | 'none'>('none');

  useEffect(() => {
    const timeInterval = setInterval(() => setTime(new Date()), 1000);

    setBattery(KaiOS.battery.level * 100);
    const handleLevelChange = () => setBattery(KaiOS.battery.level * 100);
    KaiOS.battery.addEventListener('levelchange', handleLevelChange);

    setConnection(KaiOS.connection.type);
    const handleTypeChange = () => setConnection(KaiOS.connection.type);
    KaiOS.connection.addEventListener('typechange', handleTypeChange);

    return () => {
      clearInterval(timeInterval);
      KaiOS.battery.removeEventListener('levelchange', handleLevelChange);
      KaiOS.connection.removeEventListener('typechange', handleTypeChange);
    };
  }, []);

  function renderIcon() {
    switch (connection) {
      case 'cellular':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="18px"
            viewBox="0 0 24 24"
            width="18px"
            fill="var(--primary-text-color)"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M17 4h3v16h-3V4zM5 14h3v6H5v-6zm6-5h3v11h-3V9z" />
          </svg>
        );
      case 'wifi':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="18px"
            viewBox="0 0 24 24"
            width="18px"
            fill="var(--primary-text-color)"
          >
            <path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
        );
      default:
        return null;
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.text}>{props.text}</div>
      {renderIcon()}
      <div className={styles.battery}>
        {battery}
        <span>%</span>
      </div>
      <div className={styles.time}>{format(time, 'h:mm')}</div>
    </div>
  );
}
