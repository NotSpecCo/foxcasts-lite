import { h, createContext, VNode } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { ComponentBaseProps } from '../models';

type ViewContextValue = {
  appbarOpen: boolean;
  setAppbarOpen: (open: boolean) => void;
};

const defaultValue: ViewContextValue = {
  appbarOpen: false,
  setAppbarOpen: (open) => {
    console.log(open);
  },
};

const ViewContext = createContext<ViewContextValue>(defaultValue);

type ViewProviderProps = ComponentBaseProps;

export function ViewProvider(props: ViewProviderProps): VNode {
  const [appbarOpen, setAppbarOpen] = useState(false);

  return (
    <ViewContext.Provider
      value={{
        appbarOpen,
        setAppbarOpen,
      }}
    >
      {props.children}
    </ViewContext.Provider>
  );
}

export function useView(): ViewContextValue {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}
