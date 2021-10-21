import { h, VNode } from 'preact';
import styles from './View.module.css';
import { Tab, ViewTabs } from './ViewTabs';
import { ViewContent } from './ViewContent';
import { joinClasses } from '../../utils/classes';
import { ComponentBaseProps } from '../../models';
import { ViewProvider } from '../../contexts/ViewProvider';

type Props = ComponentBaseProps & {
  backgroundImageUrl?: string;
  backgroundShift?: number;
  accentColor?: string;

  // tabs?: Tab[];
  // selectedTabId?: string;
  // onTabChange?: (id: string) => void;

  // appBarText?: string;
  // appBarActions?: AppBarItem[];
  // onAppBarAction?: (id: string) => void;
};

export function View({
  // tabs = [],
  // appBarText = 'Select',
  // appBarActions = [],
  ...props
}: Props): VNode {
  return (
    <ViewProvider>
      <div
        className={joinClasses(styles.root)}
        style={{
          backgroundImage: props.backgroundImageUrl
            ? `url(${props.backgroundImageUrl})`
            : 'none',
          backgroundPositionX:
            props.backgroundShift !== undefined
              ? `${props.backgroundShift}%`
              : '50%',
          backgroundPositionY: 'top',
          '--app-accent-color': props.accentColor || 'inherit',
          '--accent-text-color': props.accentColor || 'inherit',
        }}
      >
        <div className={styles.backdrop}>
          {/* {tabs.length > 0 ? (
          <ViewTabs
            tabs={tabs}
            selectedId={props.selectedTabId || tabs[0]?.id}
            onChange={props.onTabChange}
          />
        ) : null}
        <ViewContent>{props.children}</ViewContent>
        <AppBar
          centerText={appBarText}
          actions={appBarActions}
          onAction={props.onAppBarAction}
        /> */}
          {props.children}
        </div>
      </div>
    </ViewProvider>
  );
}
