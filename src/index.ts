import { FrontExport, ExportOptions } from "./export"

const options : ExportOptions = {
    shouldIncludeMessages: true,
    shouldIncludeAttachments: true,
    shouldIncludeComments: false
}

import { Logger } from "./logging";
const log = Logger.getLogger("Export");

// Load a file called "required.txt" and add contents to a new array named requiredConversations
import fs from 'fs';

// Read the contents of 'required.txt' synchronously and split them by newline
const requiredConversations: string[] = fs.readFileSync('required.txt', 'utf8').split("\n");

// Loop through the requiredConversations array and print each item to the console
for (const conversation of requiredConversations) {
    log.info(`${conversation}`);
}

// Export conversations matching the requiredConversations array
FrontExport.exportSearchSpecific(requiredConversations, '"google"', { after: 1704067200 }, ['open'], options)
    .then(conversations => {
        log.info("Required:", requiredConversations.length); 
        log.info("Total Found:", conversations.length);
    })

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


// Export all conversations from a specific inbox
/*
FrontExport.listInboxes()
.then(inboxes => {
    const inboxToExport = inboxes.find(inbox => inbox.id === 'inb_ndb'); // Export from a specific Inbox
    if (inboxToExport) {
        return FrontExport.exportInboxConversations(inboxToExport, options)
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


// ==============================================
// Ignore everything below this line - these are 
// examples of how to use the API
// ==============================================

// Export all conversations containing the word "google" after certain date (in UNIX time format)
/*
FrontExport.exportSearchConversations(requiredConversations, '"google"', { after: 1704067200 }, ['open'], options)
.then(conversations => {
    console.log("Total:", conversations.length);
})
*/

// Export all conversations from all inboxes available to the API key
/*
FrontExport.listInboxes()
.then(inboxes => {
    for (const inbox of inboxes) {
        FrontExport.exportInboxConversations(inbox, options)
        .then(conversations => {
            console.log(conversations.length);
        });
    }
})
*/
