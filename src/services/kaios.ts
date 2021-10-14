const mozNavigator = navigator as any;

type Manifest = {};
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

type StorageName = 'music' | 'pictures' | 'sdcard' | 'videos';
type StorageRequest = {
  result?: File;
  onsuccess: () => void;
  onerror: () => void;
};
type DeviceStorage = {
  storageName: StorageName;
  get: (filePath: string) => StorageRequest;
};

export class KaiOS {
  static getSelfApp(): Promise<DomApplication> {
    return new Promise((resolve) => {
      mozNavigator.mozApps.getSelf().onsuccess = function (): void {
        resolve(this.result);
      };
    });
  }

  static getDeviceStorage(name: StorageName): DeviceStorage {
    return mozNavigator.getDeviceStorage(name);
  }
}
