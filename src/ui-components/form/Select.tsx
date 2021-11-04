import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import { useView } from '../../contexts/ViewProvider';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { SelectableBase } from '../hoc';
import { Menu } from '../Menu';
import styles from './Select.module.css';

type Option = {
  id: string;
  label: string;
  disabled?: boolean;
};

type Props = ComponentBaseProps &
  SelectableProps & {
    label: string;
    value: string;
    options: Option[];
    onChange?: (optionId: any) => void;
  };

export function Select(props: Props): h.JSX.Element {
  const [open, setOpen] = useState(false);

  const view = useView();

  useNavKeys(
    {
      Enter: () => {
        if (!open && props.selectable?.selected) {
          setOpen(true);
        } else {
          return false;
        }
      },
      SoftRight: () => {
        if (open) {
          setOpen(false);
        } else {
          return false;
        }
      },
    },
    {
      disabled: !props.selectable?.selected || view.appbarOpen,
      stopPropagation: true,
      capture: true,
    }
  );

  return (
    <Fragment>
      <SelectableBase {...props.selectable} className={styles.root}>
        <div className={styles.label}>{props.label}</div>
        <div className={styles.value}>
          {props.options.find((a) => a.id === props.value)?.label}
        </div>
      </SelectableBase>
      {open && (
        <Menu
          title={props.label}
          options={props.options as Option[]}
          onSelect={(id): void => {
            setOpen(false);
            props.onChange?.(id);
          }}
        />
      )}
    </Fragment>
  );
}
