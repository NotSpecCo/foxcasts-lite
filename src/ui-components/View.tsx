import { h } from 'preact';
import { useState } from 'preact/hooks';
import { AppMenu } from '../components/AppMenu';
import { useNavKeys } from '../hooks/useNavKeys';
import { ComponentBaseProps } from '../models';
import { Header } from './Header';
import { Menu, MenuOption } from './Menu';
import { MenuBar } from './MenuBar';
import styles from './View.module.css';

type Props = ComponentBaseProps & {
  showHeader?: boolean;
  showMenubar?: boolean;
  headerText?: string;
  leftMenuText?: string;
  centerMenuText?: string;
  rightMenuText?: string;
  actions?: MenuOption[];
  onAction?: (id: string) => void;
};

export function View({
  leftMenuText = 'App',
  centerMenuText = 'Select',
  rightMenuText,
  showHeader = true,
  showMenubar = true,
  ...props
}: Props): any {
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  useNavKeys(
    {
      SoftLeft: () => setAppMenuOpen(true),
      SoftRight: () => setActionsMenuOpen(true),
      Backspace: () => {
        setAppMenuOpen(false);
        setActionsMenuOpen(false);
      },
      Escape: () => {
        setAppMenuOpen(false);
        setActionsMenuOpen(false);
      },
      ArrowLeft: () => window.history.back(),
      ArrowRight: () => window.history.forward(),
    },
    { disabled: appMenuOpen || actionsMenuOpen }
  );

  return (
    <div className={styles.root}>
      {showHeader && <Header text={props.headerText} />}
      <div className={styles.content}>{props.children}</div>
      {showMenubar && (
        <MenuBar
          leftText={leftMenuText}
          centerText={centerMenuText}
          rightText={rightMenuText}
        />
      )}
      {appMenuOpen && <AppMenu onClose={(): void => setAppMenuOpen(false)} />}
      {actionsMenuOpen && props.actions && (
        <Menu
          options={props.actions}
          closeSide="right"
          onSelect={(id): void => props.onAction?.(id)}
          onClose={(): void => setActionsMenuOpen(false)}
        />
      )}
    </div>
  );
}
