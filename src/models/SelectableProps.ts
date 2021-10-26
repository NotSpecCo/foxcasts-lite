import { SelectablePriority } from '../hooks/useDpad';

export type SelectableProps = {
  selectable?: {
    id?: string | number;
    priority?: SelectablePriority;
    shortcut?: string | number;
    selected: boolean;
  };
};
