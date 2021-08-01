import { expect } from 'chai';
import formatPodcast from './formatPodcast';

describe('formatPodcast', () => {
    it('should return a properly formatted podcast', () => {
        const rawPodcast = {
            collectionId: 1,
            artistId: 'artistId',
            collectionName: 'collectionName',
            artistName: 'artistName',
            artworkUrl30: 'artworkUrl30',
            artworkUrl60: 'artworkUrl60',
            artworkUrl100: 'artworkUrl100',
            artworkUrl600: 'artworkUrl600',
            summary: 'summary',
            description: 'description',
            feedUrl: 'feedUrl'
        };

        const podcast = formatPodcast(rawPodcast);

        expect(podcast.id).equal(rawPodcast.collectionId);
        expect(podcast.authorId).equal(rawPodcast.artistId);
        expect(podcast.title).equal(rawPodcast.collectionName);
        expect(podcast.author).equal(rawPodcast.artistName);
        expect(podcast.summary).equal(rawPodcast.summary);
        expect(podcast.description).equal(rawPodcast.description);
        expect(podcast.feedUrl).equal(rawPodcast.feedUrl);

        expect(podcast.cover[30]).equal(rawPodcast.artworkUrl30);
        expect(podcast.cover[60]).equal(rawPodcast.artworkUrl60);
        expect(podcast.cover[100]).equal(rawPodcast.artworkUrl100);
        expect(podcast.cover[600]).equal(rawPodcast.artworkUrl600);
    });
});
