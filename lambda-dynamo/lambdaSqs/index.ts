import { DynamoDBClient, WriteRequest } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    BatchWriteCommand,
    BatchWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { SQSEvent, DynamoDBRecord } from "aws-lambda";

export const handler = async (event: SQSEvent): Promise<any> => {
    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const tableName = process.env.DYNAMO_TABLE_NAME as string;

    const records = event.Records; //is an array, can be a batch so for loop
    console.log("All Event Data : ", records.length, records);

    const params: BatchWriteCommandInput = {
        RequestItems: {
            [tableName]: [] as WriteRequest[],
        },
    };

    for (const record of records) {
        const body = JSON.parse(record.body);

        if (!params.RequestItems) {
            params.RequestItems = {};
        }

        if (!params.RequestItems[tableName]) {
            params.RequestItems[tableName] = [];
        }

        // params.RequestItems[tableName].push(item);
        params.RequestItems[tableName].push({
            PutRequest: {
                Item: {
                    id: body.detail.object.etag,
                    filename: body.detail.object.key,
                },
            },
        });
    }

    try {
        await dynamoDB.send(new BatchWriteCommand(params));
        //try to send as BatchWriteItem , not 1 by one BatchWriteItem

        console.log("Data inserted into DynamoDB", records.length);
    } catch (error) {
        console.error("Error inserting data into DynamoDB:", error);
        throw error;
    }
};

// const item: WriteRequest = {
//     PutRequest: {
//         Item: {
//             id: body.detail.object.etag,
//             filename: body.detail.object.key,
//         },
//     },
// };
