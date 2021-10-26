import { h } from 'preact';
import { useView } from '../../contexts/ViewProvider';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import styles from './Toggle.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    disabled?: boolean;
    value: boolean;
    onChange?: (value: boolean) => void;
  };

export function Toggle({ disabled = false, ...props }: Props): h.JSX.Element {
  const view = useView();

  useNavKeys(
    {
      Enter: () => {
        props.onChange?.(!props.value);
      },
    },
    {
      disabled: !props.selectable?.selected || view.appbarOpen,
      stopPropagation: true,
      capture: true,
    }
  );

  return (
    <div
      className={joinClasses(
        styles.root,
        ifClass(props.value, styles.on),
        ifClass(disabled, styles.disabled)
      )}
    >
      <div className={styles.background} />
      <div className={styles.handle} />
    </div>
  );
}
