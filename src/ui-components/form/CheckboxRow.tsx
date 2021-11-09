import { h } from 'preact';
import { useView } from '../../contexts/ViewProvider';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import { SelectableBase } from '../SelectableBase';
import styles from './CheckboxRow.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    label: string;
    disabled?: boolean;
    value: boolean;
    onChange?: (value: boolean) => void;
  };

export function CheckboxRow({
  disabled = false,
  ...props
}: Props): h.JSX.Element {
  const view = useView();

  useNavKeys(
    {
      Enter: () => {
        if (!disabled) props.onChange?.(!props.value);
      },
    },
    {
      disabled: !props.selectable?.selected || view.appbarOpen,
      stopPropagation: true,
      capture: true,
    }
  );

  return (
    <SelectableBase
      className={joinClasses(
        styles.root,
        ifClass(props.value, styles.on),
        ifClass(disabled, styles.disabled)
      )}
      {...props.selectable}
    >
      <div className={styles.label}>{props.label}</div>
      <div
        className={joinClasses(
          styles.checkbox,
          ifClass(props.value, styles.on)
        )}
      ></div>
    </SelectableBase>
  );
}
