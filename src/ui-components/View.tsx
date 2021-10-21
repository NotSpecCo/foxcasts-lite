import { h, VNode } from 'preact';
import { useState } from 'preact/hooks';
import { AppMenu } from '../components/AppMenu';
import { useNavKeys } from '../hooks/useNavKeys';
import { ComponentBaseProps } from '../models';
import { ifClass, joinClasses } from '../utils/classes';
import { Header } from './Header';
import { Menu, MenuOption } from './Menu';
import styles from './View.module.css';

type Props = ComponentBaseProps & {
  showHeader?: boolean;
  showMenubar?: boolean;
  backgroundImageUrl?: string;
  accentColor?: string;
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
      SoftRight: () => actions.length > 0 && setActionsMenuOpen(true),
      Backspace: () => {
        if (appMenuOpen || actionsMenuOpen) {
          setAppMenuOpen(false);
          setActionsMenuOpen(false);
          return;
        }

        // If on the main screen, let KaiOS minimize the app
        if (window.location.pathname.includes('/podcasts')) {
          return false;
        }
        window.history.back();
      },
      Escape: () => {
        setAppMenuOpen(false);
        setActionsMenuOpen(false);
      },
    },
    { disabled: appMenuOpen || actionsMenuOpen, stopPropagation: true }
  );

  return (
    <div
      className={joinClasses(
        styles.root,
        ifClass(!showHeader, styles.noHeader)
      )}
      style={{
        backgroundImage: props.backgroundImageUrl
          ? `url(${props.backgroundImageUrl})`
          : 'none',
        '--app-accent-color': props.accentColor || 'inherit',
        '--accent-text-color': props.accentColor || 'inherit',
      }}
    >
      {showHeader && props.headerText && (
        <Header text={props.headerText} className={styles.header} />
      )}
      <div className={styles.content}>{props.children}</div>
      {/* {showMenubar && (
        <AppBar
          className={styles.menubar}
          // leftText={leftMenuText}
          leftIcon="grid"
          centerText={centerMenuText}
          rightIcon="chevronUp"
          // rightText={actions.length > 0 ? rightMenuText || 'Actions' : ''}
        />
      )} */}
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
