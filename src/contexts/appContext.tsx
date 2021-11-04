import { createContext } from 'preact';

export interface AppContextProps {
  openNav: () => void;
}

const AppContext = createContext<AppContextProps>({} as AppContextProps);

export default AppContext;
