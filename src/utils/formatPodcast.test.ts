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
      feedUrl: 'feedUrl',
    };

    const podcast = formatPodcast(rawPodcast);

    expect(podcast.id).toEqual(rawPodcast.collectionId);
    expect(podcast.authorId).toEqual(rawPodcast.artistId);
    expect(podcast.title).toEqual(rawPodcast.collectionName);
    expect(podcast.author).toEqual(rawPodcast.artistName);
    expect(podcast.summary).toEqual(rawPodcast.summary);
    expect(podcast.description).toEqual(rawPodcast.description);
    expect(podcast.feedUrl).toEqual(rawPodcast.feedUrl);

    expect(podcast.cover[30]).toEqual(rawPodcast.artworkUrl30);
    expect(podcast.cover[60]).toEqual(rawPodcast.artworkUrl60);
    expect(podcast.cover[100]).toEqual(rawPodcast.artworkUrl100);
    expect(podcast.cover[600]).toEqual(rawPodcast.artworkUrl600);
  });
});
