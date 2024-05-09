import { listInboxes, exportAll, exportFromInbox } from "./main";
import yargs from 'yargs';
var colors = require('@colors/colors');

import { Logger } from "./logging";
const log = Logger.getLogger("I");

console.log(colors.magenta.bold(`Welcome to Front Exporter`));

// Define the command line options
// if there are no arguments, display the help message
if (process.argv.length <= 2) {
    yargs.showHelp();
    process.exit(0);
}

const cmdOptions = yargs
    .command('list-inboxes', 'List all inboxes available to the API key', {}, () => {
        listInboxes();
    })
    .command('export-all [resume]', 'Export all conversations from all inboxes', {}, (argv) => {
        const shouldResume = argv.resume !== undefined ? argv.resume : false;
        exportAll(shouldResume);        
    })
    .command('export-from <inboxID> [resume]', 'Export all conversations from a specific inbox', (yargs) => {
        yargs.positional('inboxID', {
            describe: 'The ID of the inbox',
            type: 'string'
        });
    }, (argv) => {
        const inboxID: string = argv.inboxID as string;
        const shouldResume = argv.resume ? argv.resume : false;
        exportFromInbox(inboxID, shouldResume);
    })
    .help('h')
    .alias('h', 'help')
    .alias('help', 'h')
    .alias('v', 'version')
    .alias('version', 'v')
    .argv;


