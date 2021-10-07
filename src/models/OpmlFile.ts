import { OpmlFeed } from '.';

export type OpmlFile = {
  filePath: string;
  title: string | null;
  dateCreated: string | null;
  dateModified: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  feeds: OpmlFeed[];
};
