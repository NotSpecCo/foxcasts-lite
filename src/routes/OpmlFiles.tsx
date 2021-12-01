import { AppBar } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { Typography } from 'mai-ui/dist/components/Typography';
import { View, ViewContent } from 'mai-ui/dist/components/view';
import { useListNav } from 'mai-ui/dist/hooks';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import Statusbar from '../components/Statusbar';
import { StorageFile } from '../models';
import { OPML } from '../services/opml';

export default function OpmlFiles(): VNode {
  const [files, setFiles] = useState<StorageFile[] | null>(null);

  useEffect(() => {
    OPML.listFiles().then(setFiles);
  }, []);

  const { selectedId } = useListNav({
    onSelect: (filePath) => {
      route(`/import/${encodeURIComponent(filePath)}`);
    },
  });

  return (
    <View>
      <Statusbar text="Choose a file" />
      <ViewContent>
        {files === null && <Typography align="center">Loading...</Typography>}
        {files?.length === 0 && <Typography align="center">No opml files found.</Typography>}
        {files?.map((file) => (
          <ListItem
            key={file.path}
            primaryText={file.name}
            secondaryText={file.path}
            selectable={{
              id: file.path,
              selected: selectedId === file.path,
            }}
          />
        ))}
      </ViewContent>
      <AppBar appMenuContent={<FoxcastsAppMenu />} />
    </View>
  );
}
