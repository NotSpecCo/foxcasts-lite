export function readFileAsText(file: File): Promise<string> {
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

export function getFile(filePathAndName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const sdcard = (navigator as any).getDeviceStorage('sdcard');
    const request = sdcard.get(filePathAndName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getFileAsUrl(filePathAndName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const sdcard = (navigator as any).getDeviceStorage('sdcard');
    const request = sdcard.get(filePathAndName);
    request.onsuccess = () => resolve(URL.createObjectURL(request.result));
    request.onerror = () => reject(request.error);
  });
}

export function saveFile(filePathAndName: string, file: Blob): Promise<File> {
  return new Promise((resolve, reject) => {
    const sdcard = (navigator as any).getDeviceStorage('sdcard');
    const request = sdcard.addNamed(file, filePathAndName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function appendFile(filePathAndName: string, file: Blob): Promise<File> {
  return new Promise((resolve, reject) => {
    const sdcard = (navigator as any).getDeviceStorage('sdcard');
    const request = sdcard.appendNamed(file, filePathAndName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function deleteFile(filePathAndName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sdcard = (navigator as any).getDeviceStorage('sdcard');
    const request = sdcard.delete(filePathAndName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
