import { add, format, set, sub } from 'date-fns';
import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { useView } from '../../contexts/ViewProvider';
import { useNavKeys } from '../../hooks/useNavKeys';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { getIndexWrap } from '../../utils/array';
import { ifClass, joinClasses } from '../../utils/classes';
import { SelectableBase } from '../SelectableBase';
import { SvgIcon } from '../SvgIcon';
import styles from './DatePicker.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    label: string;
    value?: string;
    onChange?: (value: string) => void;
  };

export function DatePicker(props: Props): h.JSX.Element {
  const [open, setOpen] = useState(false);
  const [columnIndex, setColumnIndex] = useState<number>();
  const [date, setDate] = useState<Date>(
    set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  );

  const view = useView();

  useEffect(() => {
    if (props.value) setDate(new Date(props.value));
  }, [props.value]);

  useNavKeys(
    {
      ArrowRight: () => {
        setColumnIndex(
          getIndexWrap(
            new Array(3),
            columnIndex !== undefined ? columnIndex : -1,
            1
          )
        );
      },
      ArrowLeft: () => {
        setColumnIndex(
          getIndexWrap(
            new Array(3),
            columnIndex !== undefined ? columnIndex : 3,
            -1
          )
        );
      },
      ArrowUp: () => {
        let newDate: Date | undefined;
        if (columnIndex === 0) {
          newDate = add(date, { years: 1 });
        } else if (columnIndex === 1) {
          newDate = add(date, { months: 1 });
        } else if (columnIndex === 2) {
          newDate = add(date, { days: 1 });
        }

        if (newDate) {
          setDate(newDate);
          props.onChange?.(newDate.toISOString());
        }

        return true;
      },
      ArrowDown: () => {
        let newDate: Date | undefined;
        if (columnIndex === 0) {
          newDate = sub(date, { years: 1 });
        } else if (columnIndex === 1) {
          newDate = sub(date, { months: 1 });
        } else if (columnIndex === 2) {
          newDate = sub(date, { days: 1 });
        }

        if (newDate) {
          setDate(newDate);
          props.onChange?.(newDate.toISOString());
        }

        return true;
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
      disabled: !props.selectable?.selected || view.appbarOpen || !open,
      stopPropagation: true,
      capture: true,
    }
  );
  useNavKeys(
    {
      Enter: () => {
        if (!open && props.selectable?.selected) {
          setOpen(true);
        } else {
          return false;
        }
      },
    },
    {
      disabled: !props.selectable?.selected || open,
      stopPropagation: true,
      capture: true,
    }
  );

  return (
    <Fragment>
      <SelectableBase {...props.selectable} className={styles.root}>
        <div className={styles.label}>{props.label}</div>
        <div className={styles.value}>
          {props.value ? format(new Date(props.value), 'MMM d, y') : ''}
        </div>
      </SelectableBase>
      {open && (
        <section className={styles.container}>
          <div className={styles.datepicker}>
            <div
              className={joinClasses(
                styles.col,
                ifClass(columnIndex === 0, styles.selected)
              )}
            >
              <SvgIcon icon="chevronUp" />
              <div className={styles.tile}>{date.getFullYear()}</div>
              <SvgIcon icon="chevronDown" />
            </div>
            <div
              className={joinClasses(
                styles.col,
                ifClass(columnIndex === 1, styles.selected)
              )}
            >
              <SvgIcon icon="chevronUp" />
              <div className={styles.tile}>{date.getMonth() + 1}</div>
              <SvgIcon icon="chevronDown" />
            </div>
            <div
              className={joinClasses(
                styles.col,
                ifClass(columnIndex === 2, styles.selected)
              )}
            >
              <SvgIcon icon="chevronUp" />
              <div className={styles.tile}>{date.getDate()}</div>
              <SvgIcon icon="chevronDown" />
            </div>
          </div>
          <div className={styles.bar}>
            <SvgIcon icon="cancel" />
          </div>
        </section>
      )}
    </Fragment>
  );
}
