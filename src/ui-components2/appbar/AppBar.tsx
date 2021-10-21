import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import { AppMenu } from '../../components/AppMenu';
import { SelectablePriority } from '../../hooks/useDpad';
import { useListNav } from '../../hooks/useListNav';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import { delay } from '../../utils/delay';
import styles from './AppBar.module.css';
import { MenuOption } from '../Menu';
import { IconName, SvgIcon } from '../SvgIcon';
import { AppBarListItem } from '.';
import { useView } from '../../contexts/ViewProvider';

export type AppBarItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

type Props = ComponentBaseProps & {
  leftText?: string;
  centerText?: string;
  rightText?: string;
  leftIcon?: IconName | null;
  centerIcon?: IconName | null;
  rightIcon?: IconName | null;
  actions?: MenuOption[];
  onAction?: (id: string) => void;
};

enum MenuState {
  Closed,
  Closing,
  Opening,
  Open,
}

export function AppBar({
  leftIcon = 'grid',
  actions = [],
  ...props
}: Props): h.JSX.Element {
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [openState, setOpenState] = useState(MenuState.Closed);

  const view = useView();

  async function openMenu(): Promise<void> {
    if (openState !== MenuState.Closed || actions.length === 0) return;

    setOpenState(MenuState.Opening);
    await delay(250);
    setOpenState(MenuState.Open);
    view.setAppbarOpen(true);
  }

  async function closeMenu(): Promise<void> {
    if (openState !== MenuState.Open) return;

    setOpenState(MenuState.Closing);
    await delay(250);
    setOpenState(MenuState.Closed);
    view.setAppbarOpen(false);
  }

  const { selectedId } = useListNav({
    priority: SelectablePriority.Medium,
    updateRouteOnChange: false,
    onSelect: (itemId) => {
      if (itemId) {
        props.onAction?.(itemId);
        closeMenu();
      }
    },
  });

  useNavKeys({
    SoftLeft: () => setAppMenuOpen(!appMenuOpen),
    SoftRight: () => (openState === MenuState.Open ? closeMenu() : openMenu()),
    Escape: () => {
      setAppMenuOpen(false);
      closeMenu();
    },
  });

  const right =
    actions.length > 0
      ? openState >= MenuState.Opening
        ? 'chevronDown'
        : 'chevronUp'
      : null;

  return (
    <Fragment>
      <div
        className={joinClasses(
          styles.root,
          ifClass(openState >= MenuState.Opening, styles.open)
        )}
      >
        <div className={styles.bar}>
          {leftIcon ? <SvgIcon icon={leftIcon} /> : null}
          {props.leftText ? (
            <div className={styles.left}>{props.leftText}</div>
          ) : null}
          {props.centerIcon ? <SvgIcon icon={props.centerIcon} /> : null}
          {props.centerText ? (
            <div className={styles.center}>{props.centerText}</div>
          ) : null}
          {right ? <SvgIcon icon={right} /> : null}
          {props.rightText ? (
            <div className={styles.right}>{props.rightText}</div>
          ) : null}
        </div>
        {openState > MenuState.Closed ? (
          <div className={styles.actions}>
            {actions.map((action, i) => (
              <AppBarListItem
                key={action.id}
                text={action.label}
                selectableId={action.id}
                selectablePriority={SelectablePriority.Medium}
                selectableShortcut={i + 1}
                selected={selectedId === action.id}
              />
            ))}
          </div>
        ) : null}
      </div>
      {appMenuOpen && <AppMenu onClose={(): void => setAppMenuOpen(false)} />}
    </Fragment>
  );
}
