import * as core from '@actions/core';

import { createRelease } from './create-release';
import { uploadReleaseAsset } from './upload-release-asset';
import { createReleaseAssets } from './create-release-assets';

async function run(): Promise<void> {
  try {
    const bookDirectory: string = core.getInput('directory');
    const bookName: string = core.getInput('bookname');
    const versionNumber: string = core.getInput('versionnumber');
    const languageId: string = core.getInput('languageid');
    const releaseName: string = core.getInput('releasename', { required: true });
    const gitHubToken: string = core.getInput('githubtoken', { required: true });

    // create zip and targz of jupyter book
    await createReleaseAssets(bookDirectory);

    // create release
    let newRelease = await createRelease(releaseName, gitHubToken);
    console.log(newRelease);
    if (newRelease) {
      let uploadUrl = newRelease.uploadUrl;

      // upload zip
      const zipFile = './jupyterbook.zip';
      const zipName = bookName + '-' + versionNumber + '-' + languageId + '.zip';
      await uploadReleaseAsset(uploadUrl, zipFile, zipName, 'application/zip', newRelease.releaseId, gitHubToken);

      // upload targz
      const tarFile = './jupyterbook.tar.gz';
      const tarName = bookName + '-' + versionNumber + '-' + languageId + '.tar.gz';
      await uploadReleaseAsset(uploadUrl, tarFile, tarName, 'application/x-compressed-tar', newRelease.releaseId, gitHubToken);

      core.setOutput('releaseUrl', newRelease.htmlUrl);
    } else {
      core.setFailed('Failed to create release.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
