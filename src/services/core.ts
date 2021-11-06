import { FoxcastsCore } from 'foxcasts-core';
import { PodcastQuery } from 'foxcasts-core/lib/types';
import { ArtworkBlur } from '../enums/artworkBlur';
import { ArtworkSize } from '../enums/artworkSize';

export const Core = new FoxcastsCore({
  baseUrl: 'https://api.foxcasts.com/',
  apiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZm94Y2FzdHMtbGl0ZSIsImNyZWF0ZWRBdCI6IjIwMjEtMDktMDRUMjE6NDE6MjUuODQxWiIsImlhdCI6MTYzMDc5MTY4NX0.Z9JKUYmPE59Al9q82ctGUg9SeAks9KKOjz-qDm4s3GM',
});

export async function refreshArtwork(podcastId: number): Promise<void> {
  await Core.artworks.deleteManyByQuery({ podcastIds: [podcastId] });

  await Core.artworks.query({
    podcastId,
    size: ArtworkSize.Large,
  });
  const artwork = await Core.artworks.query({
    podcastId,
    size: ArtworkSize.Medium,
  });
  Core.podcasts.update(podcastId, {
    accentColor: artwork?.palette?.vibrant,
    palette: artwork?.palette,
    artwork: artwork?.image,
  });

  await Core.artworks.query({ podcastId, size: ArtworkSize.Small });
  await Core.artworks.query({
    podcastId,
    size: ArtworkSize.Large,
    blur: ArtworkBlur.Some,
  });
}

export async function subscribe(query: PodcastQuery): Promise<number> {
  const id = await Core.podcasts.subscribe(query);
  await refreshArtwork(id);
  return id;
}
