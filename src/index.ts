import { FrontExport, ExportOptions } from "./export"

const options : ExportOptions = {
    shouldIncludeMessages: true,
    shouldIncludeAttachments: true,
    shouldIncludeComments: false
}

// Load a file called "required.txt" and add contents to a new array named requiredConversations
const fs = require('fs');
const requiredConversations = fs.readFileSync('required.txt').toString().split("\n");

// Export conversations matching the requiredConversations array
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
FrontExport.exportSearchConversations('"google"', { after: 1704067200 }, ['open'], options)
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
