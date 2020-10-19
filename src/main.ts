import * as core from '@actions/core';
import sevenBin from '7zip-bin';
import Seven from 'node-7z';

import {createRelease, releaseInfo} from './create-release';
import {uploadReleaseAsset} from './upload-release-asset';

async function run(): Promise<void> {
  try {
    const bookDirectory: string = core.getInput('directory');
    const bookName: string = core.getInput('bookname');
    const versionNumber: string = core.getInput('versionnumber');
    const languageId: string = core.getInput('languageid');
    const releaseName: string = core.getInput('releasename', { required: true });
    const gitHubToken: string  = core.getInput('githubtoken', { required: true });

    // setup 7zip
    const pathTo7zip = sevenBin.path7za.replace(/\\/g,'/');
    const bookDirectoryContent: string = bookDirectory+'/content/';
    const bookDirectoryData: string = bookDirectory+'/_data/';
    const bookDirectoryConfig: string = bookDirectory+'_config.yml';

    // core.setOutput('7zipPath', pathTo7zip);
    // console.log('7zip path: ' + pathTo7zip);
    console.log(bookDirectoryContent);
    const createZip = async (bookDirectoryContent: string,bookDirectoryData: string,bookDirectoryConfig: string) => {
      const zipStream = Seven.add('jupyterbook.zip', '*', { //[bookDirectoryContent,bookDirectoryData,bookDirectoryConfig]
        recursive: true
        , excludeArchiveType : 'zip'
        // $bin: pathTo7zip
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
    await createZip(bookDirectoryContent,bookDirectoryData,bookDirectoryConfig);
    console.log('zipped');

    // tar
    // const tarStream = Seven.add('jupyterbook.tar.gz', [bookDirectoryContent,bookDirectoryData,bookDirectoryConfig], {
    //   recursive: true
    //   , excludeArchiveType : 'tar'
    //   // $bin: pathTo7zip
    // });
    // tarStream.on('data', function (data: any) {
    //   console.log(data)
    // });

    // get datestring
    const tagName: string = new Date().toISOString();
    console.log(tagName);

    // create release
    // https://github.com/actions/create-release
    let newRelease = await createRelease(tagName, releaseName, gitHubToken);
    console.log(newRelease);
    if (newRelease) {
      let uploadUrl = newRelease.uploadUrl;

      // upload zip
      const zipFile = bookDirectory + 'jupyterbook.zip';
      const zipName = bookName + '-' + versionNumber + '-' + languageId + '.zip';
      await uploadReleaseAsset(uploadUrl, zipFile, zipName, 'application/zip', newRelease.releaseId, gitHubToken);

      // upload tar
      // const tarFile = bookDirectory + 'jupyterbook.tar.gz';
      // const tarName = bookName + '-' + versionNumber + '-' + languageId + '.tar.gz';
      // await uploadReleaseAsset(uploadUrl, tarFile, tarName, 'application/x-compressed-tar', newRelease.releaseId, gitHubToken);

      core.setOutput('releaseUrl',newRelease.htmlUrl);
    } else {
      core.error('Failed to create release.');
      core.setFailed('Failed to create release.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
