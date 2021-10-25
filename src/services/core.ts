import { FoxcastsCore } from 'foxcasts-core';
import { ArtworkBlur } from '../enums/artworkBlur';
import { ArtworkSize } from '../enums/artworkSize';

export const Core = new FoxcastsCore({
  baseUrl: 'http://api.foxcasts.com/',
  apiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZm94Y2FzdHMtbGl0ZSIsImNyZWF0ZWRBdCI6IjIwMjEtMDktMDRUMjE6NDE6MjUuODQxWiIsImlhdCI6MTYzMDc5MTY4NX0.Z9JKUYmPE59Al9q82ctGUg9SeAks9KKOjz-qDm4s3GM',
});

export async function refreshArtwork(
  podcastId: number | string
): Promise<void> {
  await Core.deleteArtworksByPodcastId(podcastId);

  const { palette } = await Core.getArtwork(podcastId, {
    size: ArtworkSize.Large,
  });
  const { image } = await Core.getArtwork(podcastId, {
    size: ArtworkSize.Medium,
  });
  Core.updatePodcast(podcastId, {
    accentColor: palette?.vibrant,
    artwork: image,
  });

  await Core.getArtwork(podcastId, { size: ArtworkSize.Small });
  await Core.getArtwork(podcastId, {
    size: ArtworkSize.Large,
    blur: ArtworkBlur.Some,
  });
}

export async function subscribeByPodexId(
  podexId: string | number
): Promise<number> {
  const id = await Core.subscribeByPodexId(podexId);
  await refreshArtwork(id);
  return id;
}

export async function subscribeByFeed(feedUrl: string): Promise<number> {
  const id = await Core.subscribeByFeedUrl(feedUrl);
  await refreshArtwork(id);
  return id;
}
