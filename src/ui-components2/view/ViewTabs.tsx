import { h, VNode } from 'preact';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import styles from './ViewTabs.module.css';

export type Tab = {
  id: string;
  label: string;
};

type Props = ComponentBaseProps & {
  tabs: Tab[];
  selectedId: string;
  onChange?: (tabId: string) => void;
};

export function ViewTabs({ tabs, selectedId, ...props }: Props): VNode<Props> {
  function changeTab(change: number): void {
    const currentIndex = tabs.findIndex((a) => a.id === selectedId);
    let newIndex = currentIndex + change;
    if (newIndex === -1) newIndex = tabs.length - 1;
    else if (newIndex === tabs.length) newIndex = 0;

    props.onChange?.(tabs[newIndex].id);
  }

  useNavKeys({
    ArrowLeft: () => changeTab(-1),
    ArrowRight: () => changeTab(1),
  });

  function orderTabs(): Tab[] {
    const newTabs = [...tabs];
    const selectedIndex = newTabs.findIndex((a) => a.id === selectedId);

    if (selectedIndex === -1) return newTabs;

    const before = newTabs.splice(0, selectedIndex);
    newTabs.splice(newTabs.length, 0, ...before);
    return newTabs;
  }
  return (
    <div className={styles.root}>
      {orderTabs().map((tab) => (
        <div
          key={tab.id}
          className={joinClasses(
            styles.tab,
            ifClass(tab.id === selectedId, styles.selected)
          )}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
