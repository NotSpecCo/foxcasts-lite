/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

export class KaiOS {
  static navigator: MozNavigator = navigator as MozNavigator;

  static app = {
    getSelf: (): Promise<DomApplication> => {
      return new Promise((resolve, reject) => {
        const request = this.navigator.mozApps.getSelf();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    getManifest: (): Promise<Manifest> => {
      return new Promise((resolve, reject) => {
        const request = this.navigator.mozApps.getSelf();
        request.onsuccess = () => resolve(request.result.manifest);
        request.onerror = () => reject(request.error);
      });
    },
  };

  static storage = {
    get: (storageName: StorageName, filePath: string): Promise<File> => {
      return new Promise((resolve, reject) => {
        const storage = this.navigator.getDeviceStorage(storageName);
        const request = storage.get(filePath);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    getAsFileUrl: (storageName: StorageName, filePathAndName: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const storage = this.navigator.getDeviceStorage(storageName);
        const request = storage.get(filePathAndName);
        request.onsuccess = () => resolve(URL.createObjectURL(request.result));
        request.onerror = () => reject(request.error);
      });
    },
    addNamed: (
      storageName: StorageName,
      file: Blob | File,
      filePathAndName: string
    ): Promise<File> => {
      return new Promise((resolve, reject) => {
        const storage = this.navigator.getDeviceStorage(storageName);
        const request = storage.addNamed(file, filePathAndName);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    appendNamed: (
      storageName: StorageName,
      file: Blob | File,
      filePathAndName: string
    ): Promise<File> => {
      return new Promise((resolve, reject) => {
        const storage = this.navigator.getDeviceStorage(storageName);
        const request = storage.appendNamed(file, filePathAndName);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    delete: (storageName: StorageName, filePathAndName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const storage = this.navigator.getDeviceStorage(storageName);
        const request = storage.delete(filePathAndName);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    search: (regex: RegExp): Promise<FileSearchResult[]> => {
      return new Promise((resolve, reject) => {
        const files: FileSearchResult[] = [];
        const sdcard = this.navigator.getDeviceStorage('sdcard');
        const cursor = sdcard.enumerate();

        cursor.onsuccess = function (): void {
          if (!this.result) {
            resolve(files);
            return;
          }

          console.log('file result', this.result);
          const match = this.result.name.match(regex);
          if (match) {
            files.push({
              name: this.result.name,
              size: this.result.size,
              type: this.result.type,
              lastModified: this.result.lastModified,
              lastModifiedDate: this.result.lastModifiedDate,
            });
          }

          this.continue();
        };

        cursor.onerror = function (): void {
          reject(this.error);
        };
      });
    },
    getActualStorageName: (storageName: StorageName): string =>
      this.navigator.getDeviceStorage(storageName)?.storageName,
  };

  static volume = {
    up: () => this.navigator.volumeManager.requestUp(),
    down: () => this.navigator.volumeManager.requestDown(),
    show: () => this.navigator.volumeManager.requestShow(),
  };

  static battery = this.navigator.battery || {
    charging: true,
    level: 0.85,
    temperature: 30,
    onlevelchange: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  static connection = this.navigator.connection.type
    ? this.navigator.connection
    : ({
        type: 'wifi',
        ontypechange: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      } as Connection);
}

type Manifest = any;
type DomApplication = {
  manifest: Manifest;
  updateManifest: null;
  manifestURL: string;
  origin: string;
  installOrigin: string;
  oldVersion: string;
  installTime: number;
  removable: boolean;
  enabled: boolean;
  role: string;

  launch: () => void;
};

type FileSearchResult = {
  name: string;
  size: number;
  type: string;
  lastModified: string;
  lastModifiedDate: Date;
};

type Request<T> = {
  error?: Error;
  result: T;
  onsuccess: () => void;
  onerror: () => void;
};

type Battery = {
  charging: boolean;
  level: number;
  temperature: number;
  onlevelchange: () => void;
  addEventListener: (event: string, cb: () => void) => void;
  removeEventListener: (event: string, cb: () => void) => void;
};

type Connection = {
  type: 'none' | 'cellular' | 'wifi';
  ontypechange: () => void;
  addEventListener: (event: string, cb: () => void) => void;
  removeEventListener: (event: string, cb: () => void) => void;
};

type StorageName = 'music' | 'pictures' | 'sdcard' | 'videos' | 'apps';

type MozNavigator = Navigator & {
  mozApps: {
    getSelf: () => Request<DomApplication>;
  };
  battery: Battery;
  connection: Connection;
  getDeviceStorage: (name: StorageName) => {
    storageName: string;
    get: (filePath: string) => Request<File>;
    addNamed: (file: File | Blob, filePath: string) => Request<File>;
    appendNamed: (file: File | Blob, filePath: string) => Request<File>;
    delete: (filePath: string) => Request<void>;
    enumerate: any;
  };
  volumeManager: {
    requestUp: () => void;
    requestDown: () => void;
    requestShow: () => void;
  };
};
