import { SelectablePriority } from '../hooks/useDpad';

export type SelectableProps = {
  // selected?: boolean;
  // selectableId?: string | number;
  // selectablePriority?: SelectablePriority;
  // selectableShortcut?: string | number;
  selectable?: {
    id?: string | number;
    priority?: SelectablePriority;
    shortcut?: string | number;
    selected: boolean;
  };
};
