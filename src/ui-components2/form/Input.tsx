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
    value?: string;
    placeholder?: string;
    size?: number;
    onChange?: (value: string) => void;
    onEnter?: (value: string) => void;
  };

export function Input({ type = 'text', ...props }: Props): h.JSX.Element {
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
        props.onEnter?.(ref.current?.value || '');
      },
    },
    {
      allowInInputs: true,
      disabled: !props.selectable?.selected || view.appbarOpen,
    }
  );

  function calculateWidth(): string {
    return props.size ? `${props.size * 10}px` : '100%';
  }

  return (
    <SelectableBase
      className={joinClasses(
        styles.root,
        ifClass(props.selectable?.selected, styles.selected),
        props.className
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
        size={props.size}
        maxLength={props.size}
        placeholder={props.placeholder}
        onChange={(ev): void => props.onChange?.(ev.currentTarget.value)}
      />
    </SelectableBase>
  );
}
