import { useContext } from 'preact/hooks';
import { PlayerContext } from '../contexts/playerContext';

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
