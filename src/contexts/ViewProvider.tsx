import { createContext, h, VNode } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { ComponentBaseProps } from '../models';

type ViewContextValue = {
  homeMenuOpen: boolean;
  appbarOpen: boolean;
  setAppbarOpen: (open: boolean) => void;
  setHomeMenuOpen: (open: boolean) => void;
};

const defaultValue: ViewContextValue = {
  homeMenuOpen: false,
  appbarOpen: false,
  setAppbarOpen: (open) => {
    console.log(open);
  },
  setHomeMenuOpen: (open) => {
    console.log(open);
  },
};

const ViewContext = createContext<ViewContextValue>(defaultValue);

type ViewProviderProps = ComponentBaseProps;

export function ViewProvider(props: ViewProviderProps): VNode {
  const [homeMenuOpen, setHomeMenuOpen] = useState(false);
  const [appbarOpen, setAppbarOpen] = useState(false);

  return (
    <ViewContext.Provider
      value={{
        homeMenuOpen,
        appbarOpen,
        setAppbarOpen,
        setHomeMenuOpen,
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
