import { mkdirSync, writeFileSync } from 'fs';
import { Conversation, Inbox, Message, Comment, Attachment } from './types';

// Handlers for saving the exported resources 

// Create a directory for the Inbox
export function exportInbox(path: string, inbox: Inbox): boolean {
    try {
        mkdirSync(path, {recursive: true});
        return true;
    } catch {
        return false;
    }
}

export function exportConversation(path: string, conversation: Conversation): boolean {
    try {
        // Creates parent directory for a given conversation
        mkdirSync(path, {recursive: true}); 
        // Write the conversation details to a file in that same directory
        writeFileSync(`${path}/${conversation.id}.json`, JSON.stringify(conversation))
        return true;
    } catch {
        return false;
    }
}

// Export the message content as a .json file
export function exportMessage(path: string, message: Message): boolean {
    try {
        writeFileSync(path, JSON.stringify(message));
        return true;
    } catch {
        return false;
    }
}

// Export the comments as a .json file
export function exportComment(path: string, comment: Comment): boolean {
    try {
        writeFileSync(path, JSON.stringify(comment));
        return true;
    } catch {
        return false;
    }
}

// Export the attachments
export function exportAttachment(path: string, attachment: Attachment, buffer: Buffer): boolean {
    try {
        // Create a sub-directory for attachments
        mkdirSync(path, {recursive: true}); 
        writeFileSync(`${path}/${attachment.filename}`, buffer);
        return true;
    } catch {
        return false;
    }
}

// Export the message content as a .eml file
export function exportActualMessage(messagePath: string, messageBuffer: Buffer): boolean {
    try {
        writeFileSync(messagePath, messageBuffer, 'utf8');
        return true;
    } catch {
        return false;
    }
}
