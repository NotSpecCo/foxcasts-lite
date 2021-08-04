import { h, VNode } from 'preact';
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
  actions = [],
  ...props
}: Props): VNode {
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
      {showHeader && props.headerText && (
        <Header text={props.headerText} className={styles.header} />
      )}
      <div className={styles.content}>{props.children}</div>
      {showMenubar && (
        <MenuBar
          className={styles.menubar}
          leftText={leftMenuText}
          centerText={centerMenuText}
          rightText={actions.length > 0 ? rightMenuText || 'Actions' : ''}
        />
      )}
      {appMenuOpen && <AppMenu onClose={(): void => setAppMenuOpen(false)} />}
      {actionsMenuOpen && actions && (
        <Menu
          options={actions}
          closeSide="right"
          onSelect={(id): void => props.onAction?.(id)}
          onClose={(): void => setActionsMenuOpen(false)}
        />
      )}
    </div>
  );
}
