import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import { EpisodesQuery, FilterList, Podcast } from 'foxcasts-core/lib/types';
import { AppBar } from 'mai-ui/dist/components/appbar';
import {
  CheckboxRow,
  DatePicker,
  Input,
  RangeRow,
  Select,
  ToggleRow,
} from 'mai-ui/dist/components/form';
import { List, ListSection } from 'mai-ui/dist/components/list';
import { View, ViewContent, ViewHeader } from 'mai-ui/dist/components/view';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import { useListNav } from '../hooks/useListNav';
import { FilterViewOptions } from '../models';
import { Core } from '../services/core';
import styles from './FilterListEditor.module.css';

interface Props {
  listId: string;
  selectedItemId?: string;
}

type Sections = {
  days: boolean;
  dates: boolean;
  duration: boolean;
  playbackStatus: boolean;
  podcasts: boolean;
};

export default function FilterListEditor({
  listId,
  selectedItemId,
}: Props): VNode {
  const [list, setList] = useState<FilterList<FilterViewOptions>>();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [sections, setSections] = useState<Sections>({
    days: false,
    dates: false,
    duration: false,
    playbackStatus: false,
    podcasts: false,
  });

  useEffect(() => {
    Core.filters
      .query<FilterViewOptions>({ id: Number(listId) })
      .then((res) => {
        setList(res);
        setSections({
          days: res?.query.withinDays ? true : false,
          dates: res?.query.afterDate || res?.query.beforeDate ? true : false,
          duration:
            res?.query.longerThan !== undefined ||
            res?.query.shorterThan !== undefined
              ? true
              : false,
          playbackStatus:
            res?.query.playbackStatuses !== undefined ? true : false,
          podcasts: res?.query.podcastIds !== undefined ? true : false,
        });
      });
    Core.podcasts.queryAll({}).then(setPodcasts);
  }, []);

  function updateList(key: keyof FilterList, value: any) {
    return Core.filters
      .update(Number(listId), {
        [key]: value,
      })
      .then(() => Core.filters.query<FilterViewOptions>({ id: Number(listId) }))
      .then(setList);
  }

  function updateQuery(key: keyof EpisodesQuery, value: any): Promise<void> {
    console.log(key, value);

    const newQuery: EpisodesQuery = {
      ...list?.query,
      [key]: value,
    };
    return Core.filters
      .update(Number(listId), { query: newQuery })
      .then(() => Core.filters.query<FilterViewOptions>({ id: Number(listId) }))
      .then(setList);
  }

  function multipleUpdateQuery(
    keys: (keyof EpisodesQuery)[],
    values: any[]
  ): Promise<void> {
    console.log(keys, values);

    const newQuery: EpisodesQuery = {
      ...list?.query,
    };

    keys.forEach((key, i) => {
      newQuery[key] = values[i];
    });

    return Core.filters
      .update(Number(listId), { query: newQuery })
      .then(() => Core.filters.query<FilterViewOptions>({ id: Number(listId) }))
      .then(setList);
  }

  async function updateSection(key: keyof Sections, value: boolean) {
    if (key === 'playbackStatus') {
      updateQuery('playbackStatuses', value ? [] : undefined);
    } else if (key === 'dates') {
      await multipleUpdateQuery(
        ['afterDate', 'beforeDate', 'withinDays'],
        [undefined, undefined, undefined]
      );
    } else if (key === 'duration') {
      await multipleUpdateQuery(
        ['longerThan', 'shorterThan'],
        [undefined, undefined]
      );
    } else if (key === 'podcasts') {
      await updateQuery('podcastIds', value ? [] : undefined);
    } else if (key === 'days') {
      await updateQuery('withinDays', value ? 7 : undefined);
    }

    setSections({
      ...sections,
      [key]: value,
    });
  }

  function updateViewOption(key: keyof FilterViewOptions, value: any) {
    if (!list?.viewOptions) return;

    return Core.filters
      .update<FilterViewOptions>(Number(listId), {
        viewOptions: {
          ...list.viewOptions,
          [key]: value ? value : undefined,
        },
      })
      .then(() => Core.filters.query<FilterViewOptions>({ id: Number(listId) }))
      .then(setList);
  }

  const { selectedId } = useListNav({
    initialSelectedId: list ? selectedItemId : undefined,
  });

  return (
    <View>
      <ViewHeader>Edit Filter</ViewHeader>
      <ViewContent>
        <List>
          <ListSection>
            <Input
              value={list?.title}
              selectable={{
                id: 'listTitle',
                selected: selectedId === 'listTitle',
              }}
              onChange={(value) => updateList('title', value)}
            />
          </ListSection>
          <ListSection title="Filters">
            <ToggleRow
              label="Days"
              value={sections.days}
              selectable={{
                id: 'sectiondays',
                selected: selectedId === 'sectiondays',
              }}
              onChange={(value) => updateSection('days', value)}
            />
            {sections.days ? (
              <div className={styles.section}>
                <RangeRow
                  label="Within"
                  value={list?.query.withinDays || 0}
                  valueLabel="days"
                  min={1}
                  max={60}
                  increment={1}
                  selectable={{
                    id: 'daysWithin',
                    selected: selectedId === 'daysWithin',
                  }}
                  onChange={(value) => {
                    updateQuery('withinDays', value);
                  }}
                />
              </div>
            ) : null}
            <ToggleRow
              label="Date Range"
              value={sections.dates}
              selectable={{
                id: 'sectionDates',
                selected: selectedId === 'sectionDates',
              }}
              onChange={(value) => updateSection('dates', value)}
            />
            {sections.dates ? (
              <div className={styles.section}>
                <DatePicker
                  label="After"
                  value={list?.query.afterDate}
                  selectable={{
                    id: 'dateAfter',
                    selected: selectedId === 'dateAfter',
                  }}
                  onChange={(value) => {
                    updateQuery('afterDate', value);
                  }}
                />
                <DatePicker
                  label="Before"
                  value={list?.query.beforeDate}
                  selectable={{
                    id: 'dateBefore',
                    selected: selectedId === 'dateBefore',
                  }}
                  onChange={(value) => {
                    updateQuery('beforeDate', value);
                  }}
                />
              </div>
            ) : null}
            <ToggleRow
              label="Duration (minutes)"
              value={sections.duration}
              selectable={{
                id: 'sectionDuration',
                selected: selectedId === 'sectionDuration',
              }}
              onChange={(value) => updateSection('duration', value)}
            />
            {sections.duration ? (
              <div className={styles.section}>
                <Input
                  label="Longer Than"
                  value={
                    list?.query.longerThan !== undefined
                      ? (list.query.longerThan / 60).toString()
                      : undefined
                  }
                  type="number"
                  size={3}
                  selectable={{
                    id: 'durationLonger',
                    selected: selectedId === 'durationLonger',
                  }}
                  onEnter={(value) =>
                    updateQuery('longerThan', Number(value) * 60)
                  }
                />
                <Input
                  label="Shorter Than"
                  value={
                    list?.query.shorterThan !== undefined
                      ? (list.query.shorterThan / 60).toString()
                      : undefined
                  }
                  type="number"
                  size={3}
                  selectable={{
                    id: 'durationShorter',
                    selected: selectedId === 'durationShorter',
                  }}
                  onEnter={(value) =>
                    updateQuery('shorterThan', Number(value) * 60)
                  }
                />
              </div>
            ) : null}
            <ToggleRow
              label="Playback Status"
              value={sections.playbackStatus}
              selectable={{
                id: 'sectionPlaybackStatus',
                selected: selectedId === 'sectionPlaybackStatus',
              }}
              onChange={(value) => updateSection('playbackStatus', value)}
            />
            {sections.playbackStatus ? (
              <div className={styles.section}>
                <CheckboxRow
                  label="Unplayed"
                  value={
                    list?.query.playbackStatuses?.includes(
                      PlaybackStatus.Unplayed
                    ) || false
                  }
                  selectable={{
                    id: 'statusUnplayed',
                    selected: selectedId === 'statusUnplayed',
                  }}
                  onChange={(value): void => {
                    let newVal = [...(list?.query.playbackStatuses || [])];
                    if (!value) {
                      newVal = newVal.filter(
                        (a) => a !== PlaybackStatus.Unplayed
                      );
                    } else if (!newVal.includes(PlaybackStatus.Unplayed)) {
                      newVal.push(PlaybackStatus.Unplayed);
                    }
                    updateQuery(
                      'playbackStatuses',
                      newVal.length > 0 ? newVal : undefined
                    );
                  }}
                />
                <CheckboxRow
                  label="In Progress"
                  value={
                    list?.query.playbackStatuses?.includes(
                      PlaybackStatus.InProgress
                    ) || false
                  }
                  selectable={{
                    id: 'statusInProgress',
                    selected: selectedId === 'statusInProgress',
                  }}
                  onChange={(value): void => {
                    let newVal = [...(list?.query.playbackStatuses || [])];
                    if (!value) {
                      newVal = newVal.filter(
                        (a) => a !== PlaybackStatus.InProgress
                      );
                    } else if (!newVal.includes(PlaybackStatus.InProgress)) {
                      newVal.push(PlaybackStatus.InProgress);
                    }
                    updateQuery(
                      'playbackStatuses',
                      newVal.length > 0 ? newVal : undefined
                    );
                  }}
                />
                <CheckboxRow
                  label="Played"
                  value={
                    list?.query.playbackStatuses?.includes(
                      PlaybackStatus.Played
                    ) || false
                  }
                  selectable={{
                    id: 'statusPlayed',
                    selected: selectedId === 'statusPlayed',
                  }}
                  onChange={(value): void => {
                    let newVal = [...(list?.query.playbackStatuses || [])];
                    if (!value) {
                      newVal = newVal.filter(
                        (a) => a !== PlaybackStatus.Played
                      );
                    } else if (!newVal.includes(PlaybackStatus.Played)) {
                      newVal.push(PlaybackStatus.Played);
                    }
                    updateQuery(
                      'playbackStatuses',
                      newVal.length > 0 ? newVal : undefined
                    );
                  }}
                />
              </div>
            ) : null}
            <ToggleRow
              label="Podcasts"
              value={sections.podcasts}
              selectable={{
                id: 'sectionPodcasts',
                selected: selectedId === 'sectionPodcasts',
              }}
              onChange={(value) => updateSection('podcasts', value)}
            />
            {sections.podcasts ? (
              <div className={styles.section}>
                {podcasts?.map((podcast) => (
                  <CheckboxRow
                    label={podcast.title}
                    value={
                      list?.query.podcastIds?.includes(podcast.id) || false
                    }
                    selectable={{
                      id: `podcast${podcast.id}`,
                      selected: selectedId === `podcast${podcast.id}`,
                    }}
                    onChange={(value): void => {
                      let newVal = [...(list?.query.podcastIds || [])];
                      if (!value) {
                        newVal = newVal.filter((a) => a !== podcast.id);
                      } else if (!newVal.includes(podcast.id)) {
                        newVal.push(podcast.id);
                      }
                      updateQuery(
                        'podcastIds',
                        newVal.length > 0 ? newVal : undefined
                      );
                    }}
                  />
                ))}
              </div>
            ) : null}
            <CheckboxRow
              label="Is Downloaded"
              value={list?.query.isDownloaded === 1 || false}
              selectable={{
                id: 'otherDownloaded',
                selected: selectedId === 'otherDownloaded',
              }}
              onChange={(value): void => {
                updateQuery('isDownloaded', value ? 1 : undefined);
              }}
            />
            <CheckboxRow
              label="Is Favorite"
              value={list?.query.isFavorite === 1 || false}
              selectable={{
                id: 'otherFavorite',
                selected: selectedId === 'otherFavorite',
              }}
              onChange={(value): void => {
                updateQuery('isFavorite', value ? 1 : undefined);
              }}
            />
          </ListSection>
          <ListSection title="Episode Display">
            <Select
              label="Primary Text"
              value={list?.viewOptions.primaryText || ''}
              options={[
                { id: '', label: 'None' },
                { id: 'date', label: 'Date' },
                { id: 'title', label: 'Episode Title' },
                { id: 'description', label: 'Description' },
                { id: 'duration', label: 'Duration' },
                { id: 'fileSize', label: 'FileSize' },
                { id: 'podcastTitle', label: 'Podcast Title' },
              ]}
              selectable={{
                id: 'viewPrimary',
                selected: selectedId === 'viewPrimary',
              }}
              onChange={(id) => updateViewOption('primaryText', id)}
            />
            <Select
              label="Secondary Text"
              value={list?.viewOptions.secondaryText || ''}
              options={[
                { id: '', label: 'None' },
                { id: 'date', label: 'Date' },
                { id: 'title', label: 'Episode Title' },
                { id: 'description', label: 'Description' },
                { id: 'duration', label: 'Duration' },
                { id: 'fileSize', label: 'FileSize' },
                { id: 'podcastTitle', label: 'Podcast Title' },
              ]}
              selectable={{
                id: 'viewSecondary',
                selected: selectedId === 'viewSecondary',
              }}
              onChange={(id) => updateViewOption('secondaryText', id)}
            />
            <Select
              label="Accent Text"
              value={list?.viewOptions.accentText || ''}
              options={[
                { id: '', label: 'None' },
                { id: 'date', label: 'Date' },
                { id: 'title', label: 'Episode Title' },
                { id: 'description', label: 'Description' },
                { id: 'duration', label: 'Duration' },
                { id: 'fileSize', label: 'FileSize' },
                { id: 'podcastTitle', label: 'Podcast Title' },
              ]}
              selectable={{
                id: 'viewAccent',
                selected: selectedId === 'viewAccent',
              }}
              onChange={(id) => updateViewOption('accentText', id)}
            />
            <ToggleRow
              label="Display Artwork"
              value={list?.viewOptions.showCover || false}
              selectable={{
                id: 'viewArtwork',
                selected: selectedId === 'viewArtwork',
              }}
              onChange={(value) => updateViewOption('showCover', value)}
            />
          </ListSection>
        </List>
      </ViewContent>
      <AppBar
        appMenuContent={<FoxcastsAppMenu />}
        centerText={selectedId ? 'Select' : ''}
        actions={[
          {
            id: 'delete',
            label: 'Delete List',
            keepOpen: true,
            actionFn: () =>
              Core.filters.delete([Number(listId)]).then(() => {
                route(`/filters`, true);
              }),
          },
        ]}
      />
    </View>
  );
}
