import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useView } from '../../contexts/ViewProvider';
import { SelectablePriority } from '../../hooks/useDpad';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import { SelectableBase } from '../hoc';
import styles from './Input.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    label?: string;
    type?: 'text' | 'number';
    value: string;
    size?: number;
    onChange?: (value: string) => void;
  };

export function Input({
  type = 'text',
  size = 10,
  ...props
}: Props): h.JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const view = useView();

  useEffect(() => {
    props.selectable?.selected
      ? ref.current?.focus({ preventScroll: true })
      : ref.current?.blur();
  }, [props.selectable?.selected]);

  useNavKeys(
    {
      Enter: () => {
        props.onChange?.(ref.current?.value || '');
      },
    },
    {
      allowInInputs: true,
      disabled: !props.selectable?.selected || view.appbarOpen,
    }
  );

  function calculateWidth(): string {
    // const result = `${ref.current?.value.length * 10}px`;
    // console.log(result);

    // return result;
    return `${size * 10}px`;
  }

  return (
    <SelectableBase
      className={joinClasses(
        styles.root,
        ifClass(props.selectable?.selected, styles.selected)
      )}
      {...props.selectable}
    >
      <div>{props.label}</div>
      <input
        style={{
          width: calculateWidth(),
        }}
        type={type}
        value={props.value}
        ref={ref}
        size={size}
        maxLength={size}
      />
    </SelectableBase>
  );
}
