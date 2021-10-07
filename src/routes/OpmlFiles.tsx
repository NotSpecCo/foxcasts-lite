import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useDpad } from '../hooks/useDpad';
import { ListItem, View } from '../ui-components';
import { OPML } from '../services/opml';
import { StorageFile } from '../models';
import { Typography } from '../ui-components/Typography';
import { route } from 'preact-router';

export default function OpmlFiles(): VNode {
  const [files, setFiles] = useState<StorageFile[] | null>(null);

  useEffect(() => {
    OPML.listFiles().then(setFiles);
  }, []);

  useDpad({
    onEnter: (filePath) => {
      console.log(filePath);
      route(`/import/${encodeURIComponent(filePath)}`);
    },
  });

  return (
    <View headerText="Choose a file">
      {files === null && <Typography align="center">Loading...</Typography>}
      {files?.length === 0 && (
        <Typography align="center">No opml files found.</Typography>
      )}
      {files?.map((file) => (
        <ListItem
          key={file.path}
          itemId={file.path}
          primaryText={file.name}
          secondaryText={file.path}
        />
      ))}
    </View>
  );
}
