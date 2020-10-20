import Seven from 'node-7z';

export async function createReleaseAssets(bookDirectory: string) {
    // setup 7zip
    const bookDirectoryContent: string = bookDirectory + '/content/';
    const bookDirectoryData: string = bookDirectory + '/_data/';
    const bookDirectoryConfig: string = bookDirectory + '/_config.yml';

    console.log(bookDirectoryContent);
    const createZip = async (bookDirectoryContent: string, bookDirectoryData: string, bookDirectoryConfig: string) => {
        const zipStream = Seven.add('jupyterbook.zip', [bookDirectoryContent, bookDirectoryData, bookDirectoryConfig], {
            recursive: true
        });

        await new Promise((resolve, reject) => {
            zipStream.on('end', () => {
                resolve();
            });
            zipStream.on('error', (err: any) => {
                console.log(err);
                reject(err.stderr);
            })
        })
    };
    await createZip(bookDirectoryContent, bookDirectoryData, bookDirectoryConfig);
    console.log('zipped');

    const createTar = async (bookDirectoryContent: string, bookDirectoryData: string, bookDirectoryConfig: string) => {
        const tarStream = Seven.add('jupyterbook.tar', [bookDirectoryContent, bookDirectoryData, bookDirectoryConfig], {
            recursive: true
        });
        await new Promise((resolve, reject) => {
            tarStream.on('end', () => {
                resolve();
            });
            tarStream.on('error', (err: any) => {
                console.log(err);
                reject(err.stderr);
            })
        })
    };
    await createTar(bookDirectoryContent, bookDirectoryData, bookDirectoryConfig);
    console.log('tarred');

    const createGz = async () => {
        const gzStream = Seven.add('jupyterbook.tar.gz', './jupyterbook.tar', {
        });
        await new Promise((resolve, reject) => {
            gzStream.on('end', () => {
                resolve();
            });
            gzStream.on('error', (err: any) => {
                console.log(err);
                reject(err.stderr);
            })
        })
    };
    await createGz();
    console.log('gzed');

}