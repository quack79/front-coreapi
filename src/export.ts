import { Conversation, Inbox, Message, Comment, Attachment, ExportOptions } from './types'
import { exportInbox, exportConversation, exportMessage, exportComment, exportAttachment, exportEMLMessage } from './helpers';
import { FrontConnector } from './connector';
const cliProgress = require('cli-progress');
import fs from 'fs-extra';

var colors = require('@colors/colors');
import { Logger } from "./logging";
const log = Logger.getLogger("E");

export class FrontExport {

    /**
    * Lists all inboxes for the company.
    *
    * @returns An array of inbox objects.
    */
    public static async listInboxes(): Promise<Inbox[]> {
        return FrontConnector.makePaginatedAPIRequest<Inbox>(`https://api2.frontapp.com/inboxes`);
    }

    /**
    * Exports all conversations for an inbox.
    *
    * @param inbox - The inbox object to export conversations from.
    * @param options - An optional object containing export options.
    * @param shouldResume - A boolean indicating whether to resume the export process from a previous state.
    * @returns A Promise that resolves to an array of Conversation objects.
    */
    public static async exportInboxConversations(inbox: Inbox, options?: ExportOptions, shouldResume?: boolean): Promise<Conversation[]> {
        let requiredConversations: string[] = [];
        const inboxPath = `./export/${inbox.name.replace(/ /g, '_')}`;
        const outputFilePath = `${inboxPath}/${inbox.id}.json`;

        // check if a directory for the inbox exists, if not, create it
        if (exportInbox(inboxPath, inbox)) {
            if (fs.existsSync(outputFilePath)) {
                // check if JSON file already exists, read it into the inboxConversations array and run the export
                console.log(colors.green(`Using existing JSON file for Export: ${outputFilePath}`));
                log.debug(`Using existing JSON file for Export: ${outputFilePath}`);
                requiredConversations = FrontExport.getCurrentProgress(inboxPath, outputFilePath, shouldResume);
                const inboxConversations = JSON.parse(fs.readFileSync(outputFilePath).toString());
                return this._exportConversationsWithOptions(inboxConversations, inboxPath, requiredConversations, shouldResume, options);
            } else {
                // if JSON file doesn't exist, call the API and save received data to disk in case there is a network error
                const inboxConversationsUrl = `https://api2.frontapp.com/inboxes/${inbox.id}/conversations`;
                log.warn(`Loading conversations from API, this may take a while...`);
                const inboxConversations = await FrontConnector.makePaginatedAPIRequest<Conversation>(inboxConversationsUrl);
                console.log(colors.green(`Saving list of conversations to: ${outputFilePath}`));
                const jsonData = JSON.stringify(inboxConversations, null, 2);
                await fs.promises.writeFile(outputFilePath, jsonData);
                console.log(colors.green(`Conversations have been saved to: ${outputFilePath}`));
                log.debug(`Conversations have been saved to: ${outputFilePath}`);
                requiredConversations = FrontExport.getCurrentProgress(inboxPath, outputFilePath, shouldResume);
                return this._exportConversationsWithOptions(inboxConversations, inboxPath, requiredConversations, shouldResume, options);
            }
        } else {
            throw new Error(`Unable to create directory for inbox: ${inbox.id}`);
        }
    }

    /**
    * Retrieves the list of conversation IDs that are still pending in the export process.
    *
    * @param inboxPath - The path to the inbox directory.
    * @param outputFilePath - The path to the output file containing all conversation IDs.
    * @param shouldResume - A boolean indicating whether to resume the export process from a previous state.
    * @return An array of conversation IDs that are still pending in the export process.
    */
    private static getCurrentProgress(inboxPath: string, outputFilePath: string, shouldResume?: boolean): string[] {
        const allRequired = JSON.parse(fs.readFileSync(outputFilePath, "utf8"));
        const allConversationIDs = allRequired.map((item: any) => item.id);
        const progressFilePath = `${inboxPath}/progress.log`;
        let conversationsLeft: string[];
        if (fs.existsSync(progressFilePath) && shouldResume) {
            const progressFile = fs.readFileSync(progressFilePath, "utf8")
                .toString()
                .split("\n")
                .map((id) => id.trim());
            conversationsLeft = allConversationIDs.filter((id: string) => !progressFile.includes(id));
        } else {
            conversationsLeft = allConversationIDs;
        }
        return conversationsLeft;
    }

    // ===================================================
    /**
    * Exports conversations from an inbox with options.
    *
    * @param conversations - The array of conversations to be exported.
    * @param exportPath - The path where the conversations will be exported.
    * @param conversationsRequired - An array of conversation IDs to be exported.
    * @param options - An object containing options for the export process.
    * @returns A Promise that resolves to an array of Conversation objects.
    */
    private static async _exportConversationsWithOptions(conversations: Conversation[], exportPath: string, conversationsRequired: string[], shouldResume?: boolean, options?: ExportOptions): Promise<Conversation[]> {
        log.info(`Total to Export: ${conversationsRequired.length}`);
        const progressBar1 = new cliProgress.SingleBar({
            format: 'Progress |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        progressBar1.start(conversationsRequired.length, 0);

        for (const conversation of conversations) {
            log.debug(`Using: ${conversation.id}`);

            // Check if the current conversation exists in the requiredConversations array
            // Export only the conversations that match the requiredConversations array
            if (conversationsRequired.includes(conversation.id)) {
                log.debug(`${conversation.id} is required - Exporting...`);

                // Everything past this point nests in conversation's path
                const conversationPath = `${exportPath}/${conversation.id}`;
                exportConversation(conversationPath, conversation);

                if (options?.includeMessages) {
                    if (options?.exportAsEML) {
                        const messages = await this._exportMessagesAsEML(conversationPath, conversation);
                        if (options?.includeAttachments) {
                            for (const message of messages) {
                                await this._exportMessageAttachments(conversationPath, message);
                            }
                        }
                    } else {
                        const messages = await this._exportConversationMessages(conversationPath, conversation);
                        if (options?.includeAttachments) {
                            for (const message of messages) {
                                await this._exportMessageAttachments(conversationPath, message);
                            }
                        }
                    }
                }
                if (options?.includeComments) {
                    await this._exportConversationComments(conversationPath, conversation);
                }
                progressBar1.increment();
                FrontExport.updateProgress(exportPath, conversation.id);
            } else {
                log.debug(`${conversation.id} not required - SKIPPING`);
            }
        }
        progressBar1.stop();
        return conversations;
    }

    // ==============================================
    /**
    * Exports all messages for a conversation.
    *
    * @param path - The path where the conversation is located.
    * @param conversation - The conversation from which to export messages.
    * @returns A Promise that resolves to an array of Message objects.
    */
    private static async _exportConversationMessages(path: string, conversation: Conversation): Promise<Message[]> {
        const messages = await this._listConversationMessages(conversation);
        for (const message of messages) {
            const messagePath = `${path}/${message.created_at}-message-${message.id}.json`;
            exportMessage(messagePath, message);
        }
        return messages;
    }

    /**
    * Exports all comments for a conversation.
    *
    * @param path - The path where the conversation is located.
    * @param conversation - The conversation from which to export comments.
    * @returns A Promise that resolves to an array of Comment objects.
    */
    private static async _exportConversationComments(path: string, conversation: Conversation): Promise<Comment[]> {
        const comments = await this._listConversationComments(conversation);
        for (const comment of comments) {
            const commentPath = `${path}/${comment.posted_at}-comment-${comment.id}.json`;
            exportComment(commentPath, comment);
        }
        return comments;
    }

    /**
    * Exports all attachments for a message.
    *
    * @param path - The path where the conversation is located.
    * @param message - The message from which to export attachments.
    * @returns A Promise that resolves to an array of Attachment objects.
    */
    private static async _exportMessageAttachments(path: string, message: Message): Promise<Attachment[]> {
        for (const attachment of message.attachments) {
            const attachmentPath = `${path}/attachments/${message.id}`;
            const attachmentBuffer = await FrontConnector.getAttachmentFromURL(attachment.url);
            log.debug(`Request: ${attachment.url}`);
            exportAttachment(attachmentPath, attachment, attachmentBuffer);
        }
        return message.attachments;
    }

    /**
    * Exports all messages for a conversation as .eml files.
    *
    * @param path - The path where the conversation is located.
    * @param conversation - The conversation from which to export messages.
    * @returns A Promise that resolves to an array of Message objects.
    */
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

    /**
    * Lists all messages for a conversation.
    *
    * @param conversationId - The ID of the conversation to fetch messages for.
    * @returns A Promise that resolves to an array of Message objects.
    */
    private static async _listConversationMessages(conversation: Conversation): Promise<Message[]> {
        const url = `https://api2.frontapp.com/conversations/${conversation.id}/messages`;
        return FrontConnector.makePaginatedAPIRequest<Message>(url);
    }

    /**
    * Lists all comments for a conversation.
    *
    * @param conversationId - The ID of the conversation to fetch comments for.
    * @returns A Promise that resolves to an array of Comment objects.
    */
    private static async _listConversationComments(conversation: Conversation): Promise<Comment[]> {
        const url = `https://api2.frontapp.com/conversations/${conversation.id}/comments`;
        return FrontConnector.makePaginatedAPIRequest<Comment>(url);
    }

    /**
    * Updates the progress file for the given conversation id.
    * @param path the path to the progress file
    * @param conversationId the conversation id to update the progress for
    */
    private static async updateProgress(path: string, conversationId: any): Promise<void> {
        await fs.outputFile(`${path}/progress.log`, `${conversationId}\n`, { flag: 'a' });
    }

}
