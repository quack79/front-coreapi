import { FrontExport, ExportOptions } from "./export"

const options : ExportOptions = {
    shouldIncludeMessages: true,
    shouldIncludeAttachments: true,
    shouldIncludeComments: false
}

FrontExport.listInboxes()
.then(inboxes => {
    const inboxToExport = inboxes.find(inbox => inbox.id === 'inb_ndb'); // Export a specific Inbox
    if (inboxToExport) {
        return FrontExport.exportInboxConversations(inboxToExport, options)
        .then(conversations => {
                console.log(conversations.length);
        });
    } else {
        throw new Error("Inbox with ID 'inb_ndb' not found.");
    }
})
.catch(error => {
    console.error("Error exporting conversations:", error);
});



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
