import { h } from 'preact';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps, Option, SelectableProps } from '../../models';
import { getIndexWrap } from '../../utils/array';
import { ifClass, joinClasses } from '../../utils/classes';
import { SelectableBase } from '../SelectableBase';
import { IconSize, SvgIcon } from '../SvgIcon';
import styles from './AppBarListOption.module.css';

export type AppBarOption = {
  id: string;
  label: string;
  disabled?: boolean;
  options: Option[];
  currentValue: string | number;
};

type Props = ComponentBaseProps &
  SelectableProps & {
    label: string;
    optionId: string;
    options: Option[];
    selectedOptionId: string | number;
    onChange?: (id: string, value: string | number) => void;
  };

export function AppBarListOption(props: Props): h.JSX.Element {
  function change(change: 1 | -1): void {
    const nextIndex = getIndexWrap(
      props.options,
      props.options.findIndex((a) => a.id === props.selectedOptionId),
      change
    );
    props.onChange?.(props.optionId, props.options[nextIndex].id);
  }

  useNavKeys({
    ArrowLeft: () => {
      if (props.selectable?.selected) {
        change(-1);
        return true;
      }
    },
    ArrowRight: () => {
      if (props.selectable?.selected) {
        change(1);
        return true;
      }
    },
  });

  return (
    <SelectableBase
      {...props.selectable}
      className={joinClasses(
        styles.root,
        ifClass(props.selectable?.selected, styles.selected)
      )}
    >
      {props.label}
      <div className={styles.flex} />
      <SvgIcon icon="chevronLeft" size={IconSize.Small} />
      <div className={styles.label}>
        {props.options.find((a) => a.id === props.selectedOptionId)?.label}
      </div>
      <SvgIcon icon="chevronRight" size={IconSize.Small} />
    </SelectableBase>
  );
}
