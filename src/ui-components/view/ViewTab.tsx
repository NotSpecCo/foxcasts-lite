import { h } from 'preact';
import { ViewContent } from '.';
import { ComponentBaseProps } from '../../models';

type Props = ComponentBaseProps & {
  tabId: string;
  activeTabId: string;
};

export function ViewTab(props: Props): h.JSX.Element | null {
  return props.tabId === props.activeTabId ? (
    <ViewContent>{props.children}</ViewContent>
  ) : null;
}
