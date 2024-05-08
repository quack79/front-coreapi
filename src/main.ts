import { FrontExport, ExportOptions } from "./export";
var colors = require('@colors/colors');
import fs from 'fs';

import { Logger } from "./logging";
const log = Logger.getLogger("M");

/**
* The export options specify whether to include messages, comments, and attachments in the export process, and whether to export messages as EML files.
*/
import 'dotenv/config';
import * as env from 'env-var';
const options: ExportOptions = {
    includeMessages: env.get('INCLUDEMESSAGES').default('true').required().asBool(),
    exportAsEML: env.get('EXPORTASEML').default('true').required().asBool(),
    includeAttachments: env.get('INCLUDEATTACHMENTS').default('false').required().asBool(),
    includeComments: env.get('INCLUDECOMMENTS').default('false').required().asBool(),
}

// List all inboxes available to the API key
export function listInboxes() {
    log.info(`Listing Inboxes...`);
    FrontExport.listInboxes()
        .then(inboxes => {
            console.log(colors.yellow.underline("ID"), "\t\t", colors.blue.underline("Name"));
            for (const inbox of inboxes) {
                console.log(colors.yellow(inbox.id), "\t", colors.blue(inbox.name));
                log.debug(`${inbox.id} \t ${inbox.name}`);
            }
        });
}

// TODO: Finish this function
// Resume the export from where it left off
export function resumeExport() {

// load 2 json files called "allconvos.json" and "done.json" and compare them. if an entry in 
// done.json matches allconvos.json, skip it. if it doesn't, add it to a new json file called 
// "required.json".
/*
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
*/


/*
    // Load "required.json" and add contents to a new array named requiredConversations
    const requiredConversations: string[] = JSON.parse(fs.readFileSync('required.json', 'utf8'));
    log.info(`Number Required: ${requiredConversations.length}`);


    // Export specific conversations from a specific inbox, for example, the inbox with ID 'inb_ndb'
    FrontExport.listInboxes()
        .then(inboxes => {
            log.info(`Starting export...`);
            const inboxToExport = inboxes.find(inbox => inbox.id === inboxID); // Export from a specific Inbox
            if (inboxToExport) {
                return FrontExport.exportSpecificConversations(requiredConversations, options)
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
*/
}

// Export ALL conversations from ALL inboxes available to the API key
export function exportAll() {
    // Warning: May take a very long time to complete!
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

// Export all conversations from a specific inbox, for example, an inbox with ID 'inb_abc'
export function exportFromInbox(inboxID: string) {
    FrontExport.listInboxes()
        .then(inboxes => {
            const inboxToExport = inboxes.find(inbox => inbox.id === inboxID); // Export from a specific Inbox
            if (inboxToExport) {
                return FrontExport.exportInboxConversations(inboxToExport, options)
                    .then(conversations => {
                        log.info(`Total: ${conversations.length}`);
                    });
            } else {
                throw new Error(`Inbox with ID ${inboxID} not found.`);
            }
        })
        .catch(error => {
            log.error("Error exporting conversations:", error);
        });
}

// TODO: Fix this up so it accepts command line arguments, and converts date to unix timestamp
// Export specific conversations matching the requiredConversations array
export function exportSearch(searchArgs: string) {
    FrontExport.exportSearchConversations('"google"', { after: 1704067200 }, ['open'], options)
        .then(conversations => {
            log.info(`Total: ${conversations.length}`);
        })
}
