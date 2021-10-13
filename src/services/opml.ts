import xmlFormat from 'xml-formatter';
import { OpmlFeed, OpmlFile, StorageFile } from '../models';

export class OPML {
  private originalData: OpmlFile;
  public data: OpmlFile;

  constructor(file: OpmlFile) {
    if (!file) throw new Error('Missing file parameter');

    this.originalData = file;
    this.data = file;
  }

  public async save(): Promise<void> {
    if (!this.data || !this.originalData)
      throw new Error('You must open a file first');

    const fileName = this.data.filePath;
    const backupFileName = `${fileName}.opmltbackup`;

    // Backup original file
    await OPML._saveFile(backupFileName, OPML._createBlob(this.originalData));
    await OPML._deleteFile(fileName);

    // Save new file
    await OPML._saveFile(fileName, OPML._createBlob(this.data));

    // Cleanup
    await OPML._deleteFile(backupFileName);
  }

  public update(data: Partial<OpmlFile>): OpmlFile {
    if (!this.data || !this.originalData)
      throw new Error('You must open a file first');

    this.data = {
      ...this.data,
      ...data,
    };

    return this.data;
  }

  public revertChanges(): void {
    if (!this.data || !this.originalData)
      throw new Error('You must open a file first');

    this.data = this.originalData;
  }

  static async openFile(filePathAndName: string): Promise<OPML> {
    const file = await this._openFile(filePathAndName);
    const fileText = await this._readFileAsText(file);
    const xml = new DOMParser().parseFromString(fileText, 'text/xml');

    return new OPML({
      filePath: filePathAndName,
      title: xml.querySelector('head>title')?.textContent || null,
      dateCreated: xml.querySelector('head>dateCreated')?.textContent || null,
      dateModified: xml.querySelector('head>dateModified')?.textContent || null,
      ownerName: xml.querySelector('head>ownerName')?.textContent || null,
      ownerEmail: xml.querySelector('head>ownerEmail')?.textContent || null,
      feeds: Array.from(xml.querySelectorAll('outline[xmlUrl]')).map(
        (a, i) =>
          ({
            id: `feed${i}`,
            type: a.getAttribute('type'),
            text: a.getAttribute('text'),
            xmlUrl: a.getAttribute('xmlUrl'),
            description: a.getAttribute('description'),
            htmlUrl: a.getAttribute('htmlUrl'),
            language: a.getAttribute('language'),
            title: a.getAttribute('title'),
            version: a.getAttribute('version'),
          } as OpmlFeed)
      ),
    });
  }

  static listFiles(): Promise<StorageFile[]> {
    return new Promise((resolve, reject) => {
      const opmlFiles: StorageFile[] = [];
      const sdcard = (navigator as any).getDeviceStorage('sdcard');
      const cursor = sdcard.enumerate();
      let index = 0;

      cursor.onsuccess = function (): void {
        if (!this.result) {
          resolve(opmlFiles);
          return;
        }

        const match = this.result.name.match(/([^\/]*\.opml)$/);
        if (match) {
          opmlFiles.push({
            id: `file_${index++}`,
            name: match[0] as string,
            path: this.result.name,
            lastModified: new Date(this.result.lastModified).toISOString(),
          });
        }

        this.continue();
      };

      cursor.onerror = function (): void {
        reject(this.error);
      };
    });
  }

  static async create(
    filePathAndName?: string,
    feeds: OpmlFeed[] = []
  ): Promise<OpmlFile> {
    const { storageName } = (navigator as any).getDeviceStorage('sdcard');
    const defaultFilePath = `/${storageName}/feeds_${new Date().valueOf()}.opml`;
    const file = {
      filePath: filePathAndName || defaultFilePath,
      title: 'My Feeds',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      ownerName: null,
      ownerEmail: null,
      feeds,
    };
    await this._saveFile(
      filePathAndName || defaultFilePath,
      this._createBlob(file)
    );

    return file;
  }

  private static async _openAndParseFile(
    filePathAndName: string
  ): Promise<OpmlFile> {
    const file = await this._openFile(filePathAndName);
    const fileText = await this._readFileAsText(file);
    const xml = new DOMParser().parseFromString(fileText, 'text/xml');

    return {
      filePath: filePathAndName,
      title: xml.querySelector('head>title')?.textContent || null,
      dateCreated: xml.querySelector('head>dateCreated')?.textContent || null,
      dateModified: xml.querySelector('head>dateModified')?.textContent || null,
      ownerName: xml.querySelector('head>ownerName')?.textContent || null,
      ownerEmail: xml.querySelector('head>ownerEmail')?.textContent || null,
      feeds: Array.from(xml.querySelectorAll('outline[xmlUrl]')).map(
        (a, i) =>
          ({
            id: `feed${i}`,
            type: a.getAttribute('type'),
            text: a.getAttribute('text'),
            xmlUrl: a.getAttribute('xmlUrl'),
            description: a.getAttribute('description'),
            htmlUrl: a.getAttribute('htmlUrl'),
            language: a.getAttribute('language'),
            title: a.getAttribute('title'),
            version: a.getAttribute('version'),
          } as OpmlFeed)
      ),
    };
  }

  private static async _openFile(filePathAndName: string): Promise<File> {
    if (!(navigator as any).getDeviceStorage) {
      console.log('Not running on a real device. Using example data.');
      const exampleData = await fetch('assets/example.opml').then((res) =>
        res.blob()
      );
      return exampleData as File;
    }

    return new Promise((resolve, reject) => {
      const sdcard = (navigator as any).getDeviceStorage('sdcard');
      const request = sdcard.get(filePathAndName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private static _saveFile(filePathAndName: string, file: Blob): Promise<File> {
    return new Promise((resolve, reject) => {
      const sdcard = (navigator as any).getDeviceStorage('sdcard');
      const request = sdcard.addNamed(file, filePathAndName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private static _deleteFile(filePathAndName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sdcard = (navigator as any).getDeviceStorage('sdcard');
      const request = sdcard.delete(filePathAndName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private static _readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = (err): void => {
        reader.abort();
        reject(err);
      };
      reader.onloadend = (res): void => {
        resolve(res.target?.result as string);
      };
      reader.readAsText(file);
    });
  }

  private static _encodeString(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private static _createBlob(file: OpmlFile): Blob {
    const xmlString = `
      <?xml version="1.0" encoding="ISO-8859-1"?>
      <opml version="2.0">
        <head>
          ${file.title ? `<title>${file.title}</title>` : ''}  
          ${file.ownerName ? `<ownerName>${file.ownerName}</ownerName>` : ''}
          ${
            file.ownerEmail ? `<ownerEmail>${file.ownerEmail}</ownerEmail>` : ''
          }
          ${
            file.dateCreated
              ? `<dateCreated>${file.dateCreated}</dateCreated>`
              : ''
          }
          ${
            file.dateModified
              ? `<dateModified>${file.dateModified}</dateModified>`
              : ''
          }
        </head>
        <body>
          ${file.feeds.reduce((acc, feed) => {
            let outline = '<outline ';
            if (feed.text)
              outline += `text="${this._encodeString(feed.text)}" `;
            if (feed.xmlUrl)
              outline += `xmlUrl="${this._encodeString(feed.xmlUrl)}" `;
            if (feed.type)
              outline += `type="${this._encodeString(feed.type)}" `;
            if (feed.description)
              outline += `description="${this._encodeString(
                feed.description
              )}" `;
            if (feed.htmlUrl)
              outline += `htmlUrl="${this._encodeString(feed.htmlUrl)}" `;
            if (feed.language)
              outline += `language="${this._encodeString(feed.language)}" `;
            if (feed.title)
              outline += `title="${this._encodeString(feed.title)}" `;
            if (feed.version)
              outline += `version="${this._encodeString(feed.version)}" `;

            acc += `${outline}/>\n`;
            return acc;
          }, '')}
        </body>
      </opml>
    `;

    return new Blob([xmlFormat(xmlString)], { type: 'text/xml' });
  }
}
