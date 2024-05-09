<img src="frontexporter.png" alt="Front Exporter">  


**If you want to create a backup of your Front account or you want to migrate away from Front, this handy application helps you to export your messages.**

The script can export all messages (including attachments and comments) to JSON files.

You can also export messages to .eml files which you can import directly to your mail client.

## Environment Setup

**Clone the repo**  
`$ git clone https://github.com/quack79/front-exporter.git`

**Install Node.js**  
`$ install nodejs`

**Install Yarn**  
`$ npm install --global yarn`

**Install required dependencies**  
`$ yarn install`

## Configuration

You need to set environment variables for the application by creating a `.env` text file
in the root directory of this project.  
There is a documented `.env.sample` file included.


```
API_KEY=PasteTokenHere
```
- Put your `API_KEY` here.  
If you don't have one yet, you can read how to get one from the [Developer docs](https://dev.frontapp.com/docs/create-and-revoke-api-tokens), or go directly to the [API Tokens](https://app.frontapp.com/settings/developers/tokens) page.

````
INCLUDEMESSAGES=true
````
- Specifies whether to include messages in the export process.

````
EXPORTASEML=true
````
- Specifies whether to export messages as EML files. Requires `shouldIncludeMessages` to be set to `true`.

````
INCLUDEATTACHMENTS=false
````
- Specifies whether to include attachments in the export process. Requires `shouldIncludeMessages` to be set to `true`.

````
INCLUDECOMMENTS=false
````
- Specifies whether to include comments in the export process.

## Usage

In the project directory, run:

`$ yarn start --help`

````
Command-line Options:
  $ yarn start list-inboxes                    List all inboxes available to the API key
  $ yarn start export-all [resume]             Export ALL conversations from ALL inboxes
  $ yarn start export-from <inboxID> [resume]  Export all conversations from a specific inbox
````

If you use the `resume` parameter, then a log file will be created and as a conversation is exported, this log will be updated. If there is an issue during an export, the application will attempt to resume from where it got to.

## Example

`$ yarn start list-inboxes`

`$ yarn start export-from inb_abc123 resume`