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
    const releaseName = core.getInput('releasename', { required: true });

    // setup 7zip
    const pathTo7zip = sevenBin.path7za;
    const bookDirectoryContent: string = bookDirectory+'/content/';
    const bookDirectoryData: string = bookDirectory+'/_data/';
    const bookDirectoryConfig: string = bookDirectory+'_config.yml';

    // zip
    const zipStream = Seven.add('jupyterbook.zip', [bookDirectoryContent,bookDirectoryData,bookDirectoryConfig], {
      recursive: true,
      $bin: pathTo7zip
    });

    // tar
    const tarStream = Seven.add('jupyterbook.tar.gz', [bookDirectoryContent,bookDirectoryData,bookDirectoryConfig], {
      recursive: true,
      $bin: pathTo7zip
    });

    // get datestring
    const tagName: string = new Date().toISOString();

    // create release
    // https://github.com/actions/create-release
    let newRelease = await createRelease(tagName, releaseName);
    if (newRelease) {
      let uploadUrl = newRelease.uploadUrl;

      // upload zip
      const zipFile = bookDirectory + 'jupyterbook.zip';
      const zipName = bookName + '-' + versionNumber + '-' + languageId + '.zip';
      await uploadReleaseAsset(uploadUrl, zipFile, zipName, 'application/zip');

      // upload tar
      const tarFile = bookDirectory + 'jupyterbook.tar.gz';
      const tarName = bookName + '-' + versionNumber + '-' + languageId + '.tar.gz';
      await uploadReleaseAsset(uploadUrl, tarFile, tarName, 'application/x-compressed-tar');

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
