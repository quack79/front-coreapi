import { FrontExport, ExportOptions } from "./export";
import * as fs from 'fs';

// Set required options for the export
const options : ExportOptions = {
    shouldIncludeMessages: true,
    exportAsEML: true, // If this option is set to true, the messages will only be exported as.eml files
    shouldIncludeAttachments: true,
    shouldIncludeComments: false
}

import { Logger } from "./logging";
const log = Logger.getLogger("I");

console.log(`Welcome to The Front Exporter`);

// I had an issue where a very large export failed to complete, so I had to compare
// the ids of the conversations that were actually exported to the ids of all
// conversations that were required. 

// Probably the easiest way to do this is pipe a list of directories to a file, 
// as they are named after the conversation id.

// I used http://www.listdiff.com/ to compare the 2 lists of ids, and was left 
// with a list of the missing ids.
// Then I used https://www.htmlstrip.com/string-text-to-json-list-to-json-converter
// to convert the list of required ids to JSON, and saved to a file called "required.json"

//
// It would be nice if this code could figure out where it resume from, without  
// human intervention but I'm not sure how to do that yet! 
// 
// Also, I would like to have the first run through export all the ids that will need to be exported, 
// so that it doesn't have to hit the API on a following run. Less API calls the better!
// In one inbox I am working with, there are over 28,000 emails and every run of the export currently
// loads ALL of the data, every time. This is very wasteful.
//


import yargs from 'yargs';

// Define the command line options
const myOptions = yargs
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
    .argv;

// Define the functions
function listInboxes() {
    // Implement listInboxes function logic here
    console.log('List inboxes');
}

function resumeExport() {
    // Implement resumeExport function logic here
    console.log('Resume export');
}

function exportAll() {
    // Implement exportAll function logic here
    console.log('Export all');
}

function exportFromInbox(inboxID: string) {
    // Implement exportFromInbox function logic here
    console.log('Export from inbox: ', inboxID);
}

// use meow to display a help message
/*
const cli = meow(`
    Usage
    $ front-export [options]

    Options
    --list-inboxes  List all inboxes available to the API key
    --resume        Resume the export from where it left off
    --export-all    Export all conversations from all inboxes
    --export-from <inboxID>  Export all conversations from a specific inbox, inboxID is required

    Examples
    $ front-export --list-inboxes
    $ front-export --resume
    $ front-export --export-all
    $ front-export --export-from inb_abc
`, {
    flags: {
        "list-inboxes": {
            type: "boolean"
        },
        "resume": {
            type: "boolean"
        },
        "export-all": {
            type: "boolean"
        },
        "export-from": {
            type: "string"
         }
    }
});



// Access the provided inboxID from the command line arguments
const inboxID: string = cli.input[0];

// Check if inboxID is provided
if (!inboxID && !cli.flags['export-from']) {
    console.error('Error: inboxID is required.');
    cli.showHelp();
    process.exit(1);
}

// If --export-from flag is provided, call the exportFromInbox function
if (cli.flags['export-from']) {
    exportFromInbox(cli.flags['export-from']);
} else {
    // Otherwise, use inboxID from positional argument
    exportFromInbox(inboxID);
}
*/





function listInboxes() {
    FrontExport.listInboxes()
        .then(inboxes => {
            log.info(`Listing Inboxes...`);
            for (const inbox of inboxes) {
                console.log(inbox.id);
            }
        })
}



// load 2 json files called "allconvos.json" and "done.json" and compare them. if an entry in 
// done.json matches allconvos.json, skip it. if it doesn't, add it to a new json file called 
// "required.json".
import path from "path";

function getSubdirs(dir: string): string[] {
    return fs.readdirSync(dir).filter((file: any) => fs.statSync(path.join(dir, file)).isDirectory());
}

function getCurrentProgress() {
    const subdirs = getSubdirs("export");
    fs.writeFileSync("done.json", JSON.stringify(subdirs));

    const required = JSON.parse(fs.readFileSync("allconvos.json", "utf8"));
    const subdirectories = JSON.parse(fs.readFileSync("done.json", "utf8"));
    const missing = subdirectories.filter((subdir: string) => !required.includes(subdir));
    fs.writeFileSync("required.json", JSON.stringify(missing));
}







// Code below here works as expected.

// Load "required.json" and add contents to a new array named requiredConversations
function resumeExport() {
    const requiredConversations: string[] = JSON.parse(fs.readFileSync('required.json', 'utf8'));
    log.info(`Number Required: ${requiredConversations.length}`);

    // Export specific conversations from a specific inbox, for example, the inbox with ID 'inb_ndb'
    FrontExport.listInboxes()
        .then(inboxes => {
            log.info(`Starting export...`);
            const inboxToExport = inboxes.find(inbox => inbox.id === 'inb_ndb'); // Export from a specific Inbox
            if (inboxToExport) {
                return FrontExport.exportSpecificConversations(requiredConversations, inboxToExport, options)
                    .then(conversations => {
                        console.log("Total:", conversations.length);
                    });
            } else {
                throw new Error("Inbox with ID 'inb_ndb' not found.");
            }
        })
        .catch(error => {
            console.error("Error exporting conversations:", error);
        });
}

// Export specific conversations matching the requiredConversations array
/*
FrontExport.exportSearchSpecific(requiredConversations, '"google"', { after: 1704067200 }, ['open'], options)
    .then(conversations => {
        log.info(`Total: ${conversations.length}`);
    })
*/

// ===================================================
// These are some other examples of how to use the API
// ===================================================

// Export all conversations from a specific inbox, for example, the inbox with ID 'inb_ndb'
function exportFromInbox(inboxID: string) {
    FrontExport.listInboxes()
    .then(inboxes => {
        const inboxToExport = inboxes.find(inbox => inbox.id === 'inb_ndb'); // Export from a specific Inbox
        if (inboxToExport) {
            return FrontExport.exportInboxConversations(inboxToExport, options)
            .then(conversations => {
                log.info(`Total: ${conversations.length}`);
            });
        } else {
            throw new Error("Inbox with ID 'inb_ndb' not found.");
        }
    })
    .catch(error => {
        log.error("Error exporting conversations:", error);
    });
}

// Export all conversations containing the word "google" after certain date (in UNIX time format)
/*
FrontExport.exportSearchConversations(requiredConversations, '"google"', { after: 1704067200 }, ['open'], options)
.then(conversations => {
    log.info(`Total: ${conversations.length}`);
})
*/

// Export ALL conversations from ALL inboxes available to the API key
// Warning: May take a very long time to complete!
function exportAll() {
    FrontExport.listInboxes()
    .then(inboxes => {
        for (const inbox of inboxes) {
            FrontExport.exportInboxConversations(inbox, options)
            .then(conversations => {
                log.info(`Total: ${conversations.length}`);
            });
        }
    })
    .catch(error => {
        log.error("Error exporting conversations:", error);
    });
}

