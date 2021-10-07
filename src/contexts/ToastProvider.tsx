import { h, createContext, VNode } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { ComponentBaseProps } from '../models';

type ToastContextValue = {
  message?: string;
  showing: boolean;
  showToast: (message: string) => void;
};

const defaultValue: ToastContextValue = {
  message: undefined,
  showing: false,
  showToast: (message) => {
    console.log(message);
  },
};

const ToastContext = createContext<ToastContextValue>(defaultValue);

type ToastProviderProps = ComponentBaseProps;

export function ToastProvider(props: ToastProviderProps): VNode {
  const [message, setMessage] = useState<string | undefined>();
  const [showing, setShowing] = useState(false);

  function setToast(toastMessage: string): void {
    setMessage(toastMessage);
    setShowing(true);
  }

  useEffect(() => {
    if (showing) {
      const timer = setTimeout(() => setShowing(false), 3000);
      return (): void => clearTimeout(timer);
    }
  }, [showing]);

  return (
    <ToastContext.Provider
      value={{
        message,
        showing,
        showToast: setToast,
      }}
    >
      {props.children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
