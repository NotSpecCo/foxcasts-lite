import { Episode } from 'foxcasts-core/models';
import { EpisodeService } from 'foxcasts-core/services';
import { h } from 'preact';
import { createContext } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { FileService } from '../services/fileService';

const fileService = new FileService();
fileService.status();
const episodeService = new EpisodeService();

interface FileContextProps {
    download: (episode: Episode) => Promise<void>;
    progress: number | undefined;
    queue: Episode[];
}

export const FileContext = createContext<FileContextProps>({} as any);

export function FileProvider({ children }: any) {
    const [progress, setProgress] = useState<number | undefined>(undefined);
    const { current: queue } = useRef<Episode[]>([]);

    async function requestDownload(ep: Episode) {
        const alreadyInQueue = queue.some(o => o.id === ep.id);
        if (alreadyInQueue) {
            return;
        }

        queue.push(ep);
        if (queue.length === 1) {
            download(queue[0]);
        }
    }

    async function download(ep: Episode) {
        console.log('download episode', ep);
        setProgress(0);
        try {
            const blob = await fileService.download(ep.fileUrl, setProgress);
            console.log('download complete', blob);
            // Save
        } catch (err) {
            console.error('Failed to download and save episode.', err);
        }

        queue.shift();

        if (!queue[0]) {
            setProgress(undefined);
            return;
        }

        download(queue[0]);
    }

    return (
        <FileContext.Provider value={{ download: requestDownload, progress, queue: [...queue] }}>
            {children}
        </FileContext.Provider>
    );
}
