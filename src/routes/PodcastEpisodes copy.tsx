// import { h, VNode, Fragment } from 'preact';
// import { route } from 'preact-router';
// import { useEffect, useState } from 'preact/hooks';
// import { setSelected } from '../utils/navigation';
// import { SelectablePriority, useDpad } from '../hooks/useDpad';
// import { Episode, Podcast } from 'foxcasts-core/lib/types';
// import { Core } from '../services/core';
// import { useNavKeys } from '../hooks/useNavKeys';
// import { clamp } from '../utils/clamp';
// import { View } from '../ui-components2/View';
// import { ViewHeader } from '../ui-components2/ViewHeader';
// import { ViewContent } from '../ui-components2/ViewContent';
// import { ViewTabs } from '../ui-components2/ViewTabs';
// import { AppBar } from '../ui-components2/appbar';
// import { Typography } from '../ui-components2/Typography';
// import { subDays, isAfter } from 'date-fns';
// import { ListItem } from '../ui-components2/ListItem';
// import { List } from '../ui-components2/List';
// import { ListHeader } from '../ui-components2/ListHeader';
// import { usePodcast } from '../hooks/usePodcast';
// import { useNavigation } from '../hooks/useNavigation';
// import { useListNav } from '../hooks/useListNav';

// interface PodcastDetailProps {
//   podcastId: string;
//   selectedItemId?: string;
// }

// type Shortcut = {
//   shortcutKey?: number;
// };

// type EpisodeList = {
//   today: (Episode & Shortcut)[];
//   week: (Episode & Shortcut)[];
//   month: (Episode & Shortcut)[];
//   older: (Episode & Shortcut)[];
// };

// export default function PodcastEpisodes({
//   podcastId,
//   ...props
// }: PodcastDetailProps): VNode {
//   const [podcast, setPodcast] = useState<Podcast>();
//   const [episodes, setEpisodes] = useState<Episode[]>([]);
//   const [episodeList, setEpisodeList] = useState<EpisodeList>();

//   useEffect(() => {
//     Core.getPodcastById(parseInt(podcastId, 10)).then((result) =>
//       setPodcast(result)
//     );

//     Core.getEpisodesByPodcastId(parseInt(podcastId, 10)).then((result) => {
//       setEpisodes(result);
//       const newList: EpisodeList = {
//         today: [],
//         week: [],
//         month: [],
//         older: [],
//       };

//       const now = new Date();
//       const dayDate = subDays(now, 1);
//       const weekDate = subDays(now, 7);
//       const monthDate = subDays(now, 28);

//       result.forEach((episode, i) => {
//         const shortcutKey = i + 1 <= 9 ? i + 1 : undefined;
//         if (isAfter(new Date(episode.date), dayDate)) {
//           newList.today.push({ ...episode, shortcutKey });
//         } else if (isAfter(new Date(episode.date), weekDate)) {
//           newList.week.push({ ...episode, shortcutKey });
//         } else if (isAfter(new Date(episode.date), monthDate)) {
//           newList.month.push({ ...episode, shortcutKey });
//         } else {
//           newList.older.push({ ...episode, shortcutKey });
//         }
//       });

//       // console.log('new', newList);
//       setEpisodeList(newList);
//     });
//   }, [podcastId]);

//   const { selectedId } = useListNav({
//     initialSelectedId: episodeList ? props.selectedItemId : undefined,
//     priority: SelectablePriority.Low,
//     onSelect: (id) => console.log('select', id),
//   });

//   async function handleAction(action: string): Promise<void> {
//     if (action === 'unsubscribe' && podcast) {
//       await Core.unsubscribe(podcast.id)
//         .then(() => route('/podcasts', true))
//         .catch((err) => console.error('Failed to unsubscribe', err));
//     }
//   }

//   return (
//     <View
//       actions={[{ id: 'unsubscribe', label: 'Unsubscribe' }]}
//       onAction={handleAction}
//       backgroundImageUrl={podcast?.artwork}
//     >
//       {/* <ViewHeader>{podcast?.title}</ViewHeader> */}
//       <ViewTabs
//         tabs={[
//           { id: 'episodes', label: 'episodes' },
//           { id: 'podcast', label: 'podcast' },
//         ]}
//         selectedId="episodes"
//       />
//       <ViewContent>
//         <List>
//           {episodes.map((episode, i) => (
//             <ListItem
//               key={episode.id}
//               selectableId={episode.id}
//               selectableShortcut={i + 1 <= 9 ? i + 1 : undefined}
//               selected={episode.id.toString() === selectedId}
//               primaryText={episode.title}
//               secondaryText={new Date(episode.date).toLocaleDateString()}
//             />
//           ))}
//           {/* {episodeList && episodeList.today.length > 0 && (
//             <Fragment>
//               <ListHeader>Today</ListHeader>
//               {episodeList.today.map((episode, i) => (
//                 <ListItem
//                   key={episode.id}
//                   selectableId={episode.id}
//                   selectableShortcut={episode.shortcutKey}
//                   selected={episode.id.toString() === selectedId}
//                   primaryText={episode.title}
//                 />
//               ))}
//             </Fragment>
//           )}
//           {episodeList && episodeList.week.length > 0 && (
//             <Fragment>
//               <ListHeader>This Week</ListHeader>
//               {episodeList.week.map((episode, i) => (
//                 <ListItem
//                   key={episode.id}
//                   selectableId={episode.id}
//                   selectableShortcut={episode.shortcutKey}
//                   selected={episode.id.toString() === selectedId}
//                   primaryText={episode.title}
//                 />
//               ))}
//             </Fragment>
//           )}
//           {episodeList && episodeList.month.length > 0 && (
//             <Fragment>
//               <ListHeader>This Month</ListHeader>
//               {episodeList.month.map((episode, i) => (
//                 <ListItem
//                   key={episode.id}
//                   selectableId={episode.id}
//                   selectableShortcut={episode.shortcutKey}
//                   selected={episode.id.toString() === selectedId}
//                   primaryText={episode.title}
//                 />
//               ))}
//             </Fragment>
//           )}
//           {episodeList && episodeList.older.length > 0 && (
//             <Fragment>
//               <ListHeader>Older</ListHeader>
//               {episodeList.older.map((episode, i) => (
//                 <ListItem
//                   key={episode.id}
//                   selectableId={episode.id}
//                   selectableShortcut={episode.shortcutKey}
//                   selected={episode.id.toString() === selectedId}
//                   primaryText={episode.title}
//                   secondaryText={new Date(episode.date).toLocaleDateString()}
//                 />
//               ))}
//             </Fragment>
//           )} */}
//         </List>
//       </ViewContent>
//       <AppBar centerText="Select" />
//     </View>
//   );
// }
