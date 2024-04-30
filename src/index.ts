import { listInboxes, resumeExport, exportAll, exportFromInbox } from "./main";
import yargs from 'yargs';
var colors = require('colors');

console.log(colors.green.bold(`Welcome to the Front Exporter`));

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
    .command('resume', 'Resume the export from where it left off', {}, () => {
        resumeExport();
    })
    .command('export-all', 'Export all conversations from all inboxes', {}, () => {
        exportAll();
    })
    .command('export-from <inboxID>', 'Export all conversations from a specific inbox', (yargs) => {
        yargs.positional('inboxID', {
            describe: 'The ID of the inbox',
            type: 'string'
        });
    }, (argv) => {
        const inboxID: string = argv.inboxID as string;
        exportFromInbox(inboxID);
    })
    .help('h')
    .alias('h', 'help')
    .alias('help', 'h')
    .alias('v', 'version')
    .alias('version', 'v')
    .argv;
