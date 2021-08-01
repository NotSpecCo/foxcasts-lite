import { Episode } from './Episode';

interface Cover {
    30: string;
    60: string;
    100: string;
    600: string;
}

export interface EpisodeExtended extends Episode {
    cover: Cover;
    podcastTitle: string;
}
