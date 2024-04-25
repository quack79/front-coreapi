import { FrontExport, ExportOptions } from "./export"
import fs from 'fs';

// Set required options for the export
const options : ExportOptions = {
    shouldIncludeMessages: true,
    exportAsEML: true,
    shouldIncludeAttachments: true,
    shouldIncludeComments: false
}

import { Logger } from "./logging";
const log = Logger.getLogger("I");

log.info(`Starting export...`);

// I had an issue where a very large export failed to complete, so I had to 
// compare the ids of the conversations that were actually exported to the ids 
// of the conversations that were required. Then I took the difference and
// created a .json file with the missing conversation ids.

// https://www.htmlstrip.com/string-text-to-json-list-to-json-converter
// Use the above link to convert the list of required ids to a JSON array, 
// and save to a file called "required.json"

// Load "required.json" and add contents to a new array named requiredConversations
const requiredConversations: string[] = JSON.parse(fs.readFileSync('required.json', 'utf8'));

// Export specific conversations from a specific inbox, for example, the inbox with ID 'inb_ndb'
/*
FrontExport.listInboxes()
    .then(inboxes => {
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
*/

// Export specific conversations matching the requiredConversations array
FrontExport.exportSearchSpecific(requiredConversations, '"google"', { after: 1704067200 }, ['open'], options)
    .then(conversations => {
        log.info(`Total Found: ${conversations.length}`);
        log.info(`Number Exported: ${requiredConversations.length}`);
    })


// ===================================================
// These are some other examples of how to use the API
// ===================================================

// Export all conversations from a specific inbox, for example, the inbox with ID 'inb_ndb'
/*
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
*/

// Export all conversations containing the word "google" after certain date (in UNIX time format)
/*
FrontExport.exportSearchConversations(requiredConversations, '"google"', { after: 1704067200 }, ['open'], options)
.then(conversations => {
    log.info(`Total: ${conversations.length}`);
})
*/

// Export ALL conversations from ALL inboxes available to the API key
// Warning: May take a very long time to complete!
/*
FrontExport.listInboxes()
.then(inboxes => {
    for (const inbox of inboxes) {
        FrontExport.exportInboxConversations(inbox, options)
        .then(conversations => {
            log.info(`Total: ${conversations.length}`);
        });
    }
})
*/
