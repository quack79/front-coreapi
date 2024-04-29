# Front Sample Application - CoreAPI Export
This project provides an example application that customers can use as a starting point for exporting conversations
Similar to the import sample application, this is an ETL script, with Front as the *extract* point rather than *load*. To learn more about using this sample application, visit our [Developer Portal](https://dev.frontapp.com/docs/sample-application#conversationmessage-export-application).

## Environment Setup

### `install node.js`

### `npm install --global yarn`

### `npm install typescript --save-dev`

### `yarn install`

In the project directory, run:

### `yarn start`

To run the actual export.

## Application Structure

### `connector.ts`
`FrontConnector` provides a method to make generic paginated requests for API resources and handles rate-limiting.

### `export.ts`
`FrontExport` provides methods to list and export Front resources.

### `helpers.ts`
Customers are expected to manage any transforms and loading through the methods here.

### `index.ts`
Where customers can specify what they want exported through usage of `FrontExport` methods.

### `types.ts`
Non-exhaustive typing for responses from Front's API.  Allows for easy casting in paginated responses.

## Configuration

### `.env`

Put your `API_KEY` here.

### `helpers.ts`

Define your *transform* and *load* logic here.

### `index.ts`

Logic for what will be exported here.

TODO: Better write-up!

// I had an issue where a very large export failed to complete, so I had to compare
// the ids of the conversations that were actually exported to the ids of all
// conversations that were required. 

// Probably the easiest way to do this is pipe a list of directories to a file, 
// as they are named after the conversation id.

// I used http://www.listdiff.com/ to compare the 2 lists of ids, and was left 
// with a list of the missing ids.
// Then I used https://www.htmlstrip.com/string-text-to-json-list-to-json-converter
// to convert the list of required ids to JSON, and saved to a file called "required.json"

//
// It would be nice if this code could figure out where it resume from, without  
// human intervention but I'm not sure how to do that yet! 
// 
// Also, I would like to have the first run through export all the ids that will need to be exported, 
// so that it doesn't have to hit the API on a following run. Less API calls the better!
// In one inbox I am working with, there are over 28,000 emails and every run of the export currently
// loads ALL of the data, every time. This is very wasteful.
//