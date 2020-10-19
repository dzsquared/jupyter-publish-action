import core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';

export async function uploadReleaseAsset(uploadUrl: string, assetPath: string, assetName: string, assetContentType: string, releaseId: number, gitHubToken: string) {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    // const github = new GitHub(process.env.GITHUB_TOKEN);
    const octokit = github.getOctokit(gitHubToken);
    const { owner: currentOwner, repo: currentRepo } = github.context.repo;
    const owner = currentOwner;
    const repo = currentRepo;

    // Determine content-length for header to upload asset
    const contentLength =  ( filePath: string ) => fs.statSync(filePath).size;

    // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
    const headers = { 'content-type': assetContentType, 'content-length': contentLength(assetPath) };

    // Upload a release asset
    // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
    const uploadAssetResponse = await octokit.repos.uploadReleaseAsset({
      data: fs.readFileSync(assetPath),
      headers,
      name: assetName,
      url: uploadUrl,
      owner: currentOwner,
      repo: currentRepo,
      release_id: releaseId
    });

    // Get the browser_download_url for the uploaded release asset from the response
    const {
      data: { browser_download_url: browserDownloadUrl }
    } = uploadAssetResponse;

    // Set the output variable for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    //core.setOutput('browser_download_url', browserDownloadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}