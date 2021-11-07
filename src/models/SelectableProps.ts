import { SelectablePriority } from '../enums';

export type SelectableProps = {
  selectable?: {
    id?: string | number;
    priority?: SelectablePriority;
    shortcut?: string | number;
    selected: boolean;
    ariaLabel?: string;
  };
};
