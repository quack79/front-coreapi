import { Conversation, ConversationStatus, Inbox, Message, Comment, Attachment } from './types'
import { exportInbox, exportConversation, exportMessage, exportComment, exportAttachment, exportEMLMessage } from './helpers';
import { FrontConnector } from './connector';
import * as fs from 'fs';
var colors = require('@colors/colors');

import { Logger } from "./logging";
const log = Logger.getLogger("E");

export type ExportOptions = {
    shouldIncludeMessages: boolean, 
    exportAsEML: boolean,
    shouldIncludeComments: boolean,
    shouldIncludeAttachments: boolean
}

// Unix epoch seconds timestamps
export type DateRange = {
    before?: number,
    after?: number,
    during?: number, // List conversations from the same day
}

// The "is:" search filter includes additional searchable statuses beyond those stored on the Conversation resource
// Read more at https://dev.frontapp.com/docs/search-1#supported-search-filters
export type SearchStatus = ConversationStatus | "open" | "snoozed" | "unreplied"

export class FrontExport {

    // Lists all inboxes for the company
    public static async listInboxes(): Promise<Inbox[]> {
        return FrontConnector.makePaginatedAPIRequest<Inbox>(`https://api2.frontapp.com/inboxes`);
    }

    // Export all conversations for an inbox
    public static async exportInboxConversations(inbox: Inbox, options?: ExportOptions): Promise<Conversation[]> {
    const sanitizedInboxName = inbox.name.replace(/ /g, '_');
    const inboxPath = `./export/${sanitizedInboxName}`;
    const outputFilePath = `${inboxPath}/${inbox.id}.json`;
    if (exportInbox(inboxPath, inbox)) {
        // check if JSON file already exists, read it into the inboxConversations variable and run the export
        if (fs.existsSync(outputFilePath)) {
            console.log(colors.green(`Using existing JSON file for conversations: ${outputFilePath}`));
            const inboxConversations = JSON.parse(fs.readFileSync(outputFilePath).toString());
            return this._exportConversationsWithOptions(inboxConversations, inboxPath, options);
        } else {
            // if JSON file doesn't exist, call the API and save received data to disk in case there is a network error
            const inboxConversationsUrl = `https://api2.frontapp.com/inboxes/${inbox.id}/conversations`;
            log.warn(`Loading conversations from API, this may take a while...`);
            const inboxConversations = await FrontConnector.makePaginatedAPIRequest<Conversation>(inboxConversationsUrl);
            console.log(colors.green(`Exporting list of inbox conversations to: ${outputFilePath}`));
            const jsonData = JSON.stringify(inboxConversations, null, 2);
            await fs.promises.writeFile(outputFilePath, jsonData);
            console.log(colors.green(`Inbox conversations have been exported to: ${outputFilePath}`));
            return this._exportConversationsWithOptions(inboxConversations, inboxPath, options);
        }
    } else {
        throw new Error(`Unable to create directory for inbox: ${inbox.id}`);
    }
}

    // Export all conversations returned from a search query
    public static async exportSearchConversations(searchText: string, range?: DateRange, statuses?: SearchStatus[], options?: ExportOptions): Promise<Conversation[]> {
        const searchQuery = this._buildSearchQuery(searchText, range, statuses);
        const searchUrl = `https://api2.frontapp.com/conversations/search/${searchQuery}`;
        console.log(colors.blue(`Searching API for conversations...`));
        const searchConversations = await FrontConnector.makePaginatedAPIRequest<Conversation>(searchUrl);
        return this._exportConversationsWithOptions(searchConversations, './export/search', options);
    }

    // Conversations are nested as files in directories, options are set in main.ts
    private static async _exportConversationsWithOptions(conversations: Conversation[], exportPath: string, options?: ExportOptions): Promise<Conversation[]> {
        console.log(colors.blue(`Starting export...`));
        for (const conversation of conversations) {
            log.info(`Using: ${conversation.id}`);

            // Everything past this point nests in conversation's path
            const conversationPath = `${exportPath}/${conversation.id}`;
            exportConversation(conversationPath, conversation);

            let messages: Message[] = [];


            if (options?.shouldIncludeMessages) {
                const messages = await this._exportConversationMessages(conversationPath, conversation);
    
                // Attachments get a directory matching the 
                if (options?.shouldIncludeAttachments) {
                    for (const message of messages) {
                        await this._exportMessageAttachments(conversationPath, message);
                    }     
                }
            }
            if (options?.exportAsEML) {
                const emls = await this._exportMessagesAsEML(conversationPath, conversation);
            }



            if (options?.shouldIncludeMessages) {
                if (options?.exportAsEML) {
                    const messages = await this._exportMessagesAsEML(conversationPath, conversation);
                    if (options?.shouldIncludeAttachments) {
                        for (const message of messages) {
                            await this._exportMessageAttachments(conversationPath, message);
                        }
                    }
                } else {
                    const messages = await this._exportConversationMessages(conversationPath, conversation);
                    if (options?.shouldIncludeAttachments) {
                        for (const message of messages) {
                            await this._exportMessageAttachments(conversationPath, message);
                        }
                    }
                }
            }

            if (options?.shouldIncludeMessages) {
                const messages = await this._exportConversationMessages(conversationPath, conversation);  
            }
            if (options?.exportAsEML) {
                const emls = await this._exportMessagesAsEML(conversationPath, conversation);
            }
            if (options?.shouldIncludeAttachments) {
                for (const message of messages) {
                    await this._exportMessageAttachments(conversationPath, message);
                }
            }
            if (options?.shouldIncludeComments) {
                await this._exportConversationComments(conversationPath, conversation);
            }
        }
        return conversations;
    }

    // ===========================================
    // Export specific conversations from an inbox
    // ===========================================
    /**
     * Exports specific conversations from an inbox.
     *
     * @param requiredConversations - An array of conversation IDs to be exported.
     * @param inbox - The inbox from which to export the conversations.
     * @param options - An object containing options for the export process.
     * @returns A Promise that resolves to an array of Conversation objects.
     */
    public static async exportSpecificConversations(requiredConversations: string[], inbox: Inbox, options?: ExportOptions): Promise<Conversation[]> {
        const sanitizedInboxName = inbox.name.replace(/ /g, '_');
        const inboxPath = `./export/${sanitizedInboxName}`;
        const inboxConversationsUrl = `https://api2.frontapp.com/inboxes/${inbox.id}/conversations`;
        log.warn(`Loading conversations from API, this may take a while...`);
        const inboxConversations = await FrontConnector.makePaginatedAPIRequest<Conversation>(inboxConversationsUrl);
        if (exportInbox(inboxPath, inbox)) {
            return this._exportSpecificConversationsWithOptions(requiredConversations, inboxConversations, inboxPath, options)
        }
        return inboxConversations;
    }

    /**
 * Exports specific conversations from an inbox with options.
 *
 * @param conversationsRequired - An array of conversation IDs to be exported.
 * @param conversations - The array of conversations to be exported.
 * @param exportPath - The path where the conversations will be exported.
 * @param options - An object containing options for the export process.
 * @returns A Promise that resolves to an array of Conversation objects.
 */
    private static async _exportSpecificConversationsWithOptions(conversationsRequired: string[], conversations: Conversation[], exportPath: string, options?: ExportOptions): Promise<Conversation[]> {
        for (const conversation of conversations) {
            log.info(`Using: ${conversation.id}`);

            // Check if the current conversation exists in the requiredConversations array
            // Export only the conversations that match the requiredConversations array
            if (conversationsRequired.includes(conversation.id)) {
                log.info(`Matches: ${conversation.id} - Exporting...`);

                // Everything past this point nests in conversation's path
                const conversationPath = `${exportPath}/${conversation.id}`;
                exportConversation(conversationPath, conversation);

                if (options?.shouldIncludeMessages) {
                    if (options?.exportAsEML) {
                        const messages = await this._exportMessagesAsEML(conversationPath, conversation);
                        if (options?.shouldIncludeAttachments) {
                            for (const message of messages) {
                                await this._exportMessageAttachments(conversationPath, message);
                            }
                        }
                    } else {
                        const messages = await this._exportConversationMessages(conversationPath, conversation);
                        if (options?.shouldIncludeAttachments) {
                            for (const message of messages) {
                                await this._exportMessageAttachments(conversationPath, message);
                            }
                        }
                    }
                }
                if (options?.shouldIncludeComments) {
                    await this._exportConversationComments(conversationPath, conversation);
                }
            }
        }
        return conversations;
    }

    // ==============================================
    // Export conversation messages
    // ==============================================
    private static async _exportConversationMessages(path: string, conversation: Conversation): Promise<Message[]> {
        const messages = await this._listConversationMessages(conversation);
        for (const message of messages) {
            const messagePath = `${path}/${message.created_at}-message-${message.id}.json`;
            exportMessage(messagePath, message);
        }
        return messages;
    }

    private static async _exportConversationComments(path: string, conversation: Conversation): Promise<Comment[]> {
        const comments = await this._listConversationComments(conversation);
        for (const comment of comments) {
            const commentPath = `${path}/${comment.posted_at}-comment-${comment.id}.json`;
            exportComment(commentPath, comment);
        }
        return comments;
    }

    private static async _exportMessageAttachments(path: string, message: Message): Promise<Attachment[]> {
        for (const attachment of message.attachments) {
            const attachmentPath = `${path}/attachments/${message.id}`;
            const attachmentBuffer = await FrontConnector.getAttachmentFromURL(attachment.url);
            log.debug(`Request: ${attachment.url}`);
            exportAttachment(attachmentPath, attachment, attachmentBuffer);
        }
        return message.attachments;
    }

    // Export the message content as a .eml file
    private static async _exportMessagesAsEML(path: string, conversation: Conversation): Promise<Message[]> {
        const messages = await this._listConversationMessages(conversation);
        for (const message of messages) {
            const messagePath = `${path}/${message.created_at}-${message.id}.eml`;
            const messageUrl = `https://api2.frontapp.com/messages/${message.id}`;
            log.debug(`Request: ${messageUrl}`);
            const messageBuffer = await FrontConnector.getMessageFromURL(messageUrl);
            exportEMLMessage(messagePath, messageBuffer);
        }
        return messages;
    }

    private static async _listConversationMessages(conversation: Conversation): Promise<Message[]> {
        const url = `https://api2.frontapp.com/conversations/${conversation.id}/messages`;
        return FrontConnector.makePaginatedAPIRequest<Message>(url);
    }

    private static async _listConversationComments(conversation: Conversation): Promise<Comment[]> {
        const url = `https://api2.frontapp.com/conversations/${conversation.id}/comments`;
        return FrontConnector.makePaginatedAPIRequest<Comment>(url);
    }

    private static _buildSearchQuery(text: string, range?: DateRange, statuses?: SearchStatus[]): string {
        let query = '';
        if (range) {
            query += this._buildRangeQuery(range);
        }
        if (statuses) {
            query += this._buildStatusQuery(statuses);
        }
        query += text;

        return encodeURIComponent(query);
    }

    private static _buildRangeQuery(range: DateRange): string {
        let query = '';
        // during is used separately of before and after
        if (range.during) {
            query += `during:${range.during} `;
        }
        // before and after can be used together
        else {
            if (range.before) {
                query += `before:${range.before} `;
            }
            if (range.after) {
                query += `after:${range.after} `;
            }
        }
        return query;
    }

    private static _buildStatusQuery(statuses: SearchStatus[]): string {
        let query = '';
        for (const status of statuses) {
            query += `is:${status} `;
        }
        return query;
    }

}
