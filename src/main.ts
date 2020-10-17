import * as core from '@actions/core';
import sevenBin from '7zip-bin';
import Seven from 'node-7z';
import {wait} from './wait'

import {createRelease} from './create-release';
import { create } from 'domain';

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const bookDirectory: string = core.getInput('directory');
    const releaseName: string = core.getInput('releasename');
    const bookName: string = core.getInput('bookname');
    const languageId: string = core.getInput('languageid');

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

    // create release
    // https://github.com/actions/create-release
    createRelease();

    // upload zip

    // upload tar


    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
