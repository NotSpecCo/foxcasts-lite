import { createContext } from 'preact';

export interface AppContextProps {
    openNav: () => void;
}

const AppContext = createContext<AppContextProps>({} as any);

export default AppContext;
