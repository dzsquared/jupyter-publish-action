import core from '@actions/core';
import * as github from '@actions/github'; 
import fs from 'fs';


export async function createRelease( tagName: string, release_name: string, gitHubToken: string ): Promise<releaseInfo|undefined> {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    // const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner and repo from context of payload that triggered the action
    const { owner: currentOwner, repo: currentRepo } = github.context.repo;
    const octokit = github.getOctokit(gitHubToken);

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    // const tagName = core.getInput('tag_name', { required: true });

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
    const tag: string = tagName.replace('refs/tags/', '');
    const releaseName: string = release_name.replace('refs/tags/', '');
    const body: string = "";
    const draft: boolean = false;
    const prerelease: boolean = false;
    const commitish = github.context.sha;

    const bodyPath = "";
    const owner = currentOwner;
    const repo = currentRepo;
    let bodyFileContent = null;
    if (bodyPath !== '' && !!bodyPath) {
      try {
        bodyFileContent = fs.readFileSync(bodyPath, { encoding: 'utf8' });
      } catch (error) {
        core.setFailed(error.message);
      }
    }

    // Create a release
    // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
    const createReleaseResponse = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      name: releaseName,
      body: bodyFileContent || body,
      draft,
      prerelease,
      target_commitish: commitish
    });

    // Get the ID, html_url, and upload URL for the created Release from the response
    const {
      data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl }
    } = createReleaseResponse;

    let releaseReturn = new releaseInfo(releaseId, htmlUrl, uploadUrl);
    return new Promise<releaseInfo>((resolve) => {
      resolve(releaseReturn);
    });

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    // core.setOutput('id', releaseId);
    // core.setOutput('html_url', htmlUrl);
    // core.setOutput('upload_url', uploadUrl);
   
  } catch (error)  {
    core.setFailed(error.message);
    // return undefined;
  }
}

export class releaseInfo {
  public releaseId: number;
  public htmlUrl: string;
  public uploadUrl: string;

  constructor( releaseId: number, htmlUrl: string, uploadUrl: string ) {
    this.releaseId = releaseId;
    this.htmlUrl = htmlUrl;
    this.uploadUrl = uploadUrl;
  }
}