import { FrontExport, ExportOptions } from "./export"

const options : ExportOptions = {
    shouldIncludeMessages: true,
    shouldIncludeComments: true,
    shouldIncludeAttachments: true
}

// Open conversations, after September 13th, 2020, with the exact phrase 
//FrontExport.exportSearchConversations('"cup of coffee"', {after: 1600000000}, ['open'], options)
//.then(conversations => {
//    console.log(conversations.length);
//})

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


FrontExport.listInboxes()
/*
.then(inboxes => {
    const inboxToExport = inboxes.find(inbox => inbox.id === 'inb_ndb');
    if (inboxToExport) {
        //return FrontExport.exportInboxConversations(inboxToExport, options)
        return FrontExport.exportSearchConversations('"google"', {after: 1704067200}, ['open'], options)

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
*/
//    exportMessage