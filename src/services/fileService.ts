export class FileService {
    private storage: any;

    constructor() {
        if ((window.navigator as any).getDeviceStorage) {
            this.storage = (window.navigator as any).getDeviceStorage('music');
        }
    }

    public download(url: string, progressUpdateFn?: (percent: number) => void): Promise<Blob> {
        return new Promise((resolve, reject) => {
            console.log('Downloading ' + url);

            let lastPercent = 0;
            const xhr = new (XMLHttpRequest as any)({ mozSystem: true });
            xhr.onprogress = (res: any) => {
                const percent = parseInt(((res.loaded / res.total) * 100).toString());
                if (percent > lastPercent || percent === 100) {
                    console.log(`Downloading... ${percent}%`);
                    if (progressUpdateFn) {
                        progressUpdateFn(percent);
                    }
                    lastPercent = percent;
                }
            };
            xhr.onreadystatechange = (res: any) => {
                if (res.target.readyState === 4 && res.target.status === 200) {
                    console.log('Download finished!');
                    resolve(res.target.response);
                }
            };
            xhr.onerror = (ev: any) => {
                console.log('onerror', ev);
                reject();
            };
            xhr.ontimeout = (ev: any) => {
                console.log('ontimeout', ev);
                reject();
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        });
    }

    public status() {
        console.log('status', this.storage);
        if (!this.storage) {
            return;
        }

        const cursor = this.storage.enumerate();

        cursor.onsuccess = function() {
            if (this.result) {
                const file = this.result;
                // console.log('File updated on: ' + file.lastModifiedDate);
                console.log('file', file);

                // Once we found a file we check if there are other results
                // Then we move to the next result, which calls the cursor
                // success possibly with the next file as result.
                this.continue();
            }
        };
    }

    public save(file: Blob, fileName: string) {
        console.log('save', fileName, file);
        const request = this.storage.addNamed(file, fileName);

        request.onsuccess = (response: any) => {
            // var name = this.result;
            console.log('onsuccess', response);
            console.log('File "' + name + '" successfully wrote on the sdcard storage area');
            // PodcastManager.updateEpisode(_this, 'download', sender, name);
        };

        // An error typically occur if a file with the same name already exist
        request.onerror = (e: any) => {
            console.log('onerror', e);
            console.warn('Unable to write the file');
            // alert('Unable to write file. A file with the same name may already exist.');
        };
    }
}
