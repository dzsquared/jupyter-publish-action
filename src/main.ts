import * as core from '@actions/core';
import {wait} from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const bookDirectory: string = core.getInput('directory');
    const releaseName: string = core.getInput('releasename');
    const bookName: string = core.getInput('bookname');
    const languageId: string = core.getInput('languageid');

    // zip
    

    // tar

    // get datestring

    // create release

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
