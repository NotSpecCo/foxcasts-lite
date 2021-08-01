import { Episode } from './Episode';

interface Cover {
    30: string;
    60: string;
    100: string;
    600: string;
}

export interface Podcast {
    id: number;
    authorId: string;
    title: string;
    author: string;
    cover: Cover;
    summary: string;
    description: string;
    feedUrl: string;
    episodes?: Episode[];
}
