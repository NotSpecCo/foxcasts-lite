import { useContext } from 'preact/hooks';
import { PlayerActionsContext, PlayerStateContext } from '../contexts/playerContext';

export function usePlayerState() {
    const context = useContext(PlayerStateContext);
    if (context === undefined) {
        throw new Error('usePlayerState must be used within a PlayerProvider');
    }
    return context;
}

export function usePlayerActions() {
    const context = useContext(PlayerActionsContext);
    if (context === undefined) {
        throw new Error('usePlayerActions must be used within a PlayerProvider');
    }
    return context;
}
