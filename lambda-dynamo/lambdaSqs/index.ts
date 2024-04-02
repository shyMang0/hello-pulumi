import { DynamoDBClient, WriteRequest } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    BatchWriteCommand,
    BatchWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { SQSEvent, S3ObjectCreatedNotificationEvent } from "aws-lambda";

export const handler = async (event: SQSEvent): Promise<any> => {
    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const tableName = process.env.DYNAMO_TABLE_NAME as string;

    const records = event.Records;
    console.log(
        "SQS Data : ",
        records.length,
        JSON.stringify(records, null, 2)
    );

    const params: BatchWriteCommandInput = {
        RequestItems: {
            [tableName]: [] as WriteRequest[],
        },
    };

    if (!params.RequestItems) {
        params.RequestItems = {};
    }

    for (const record of records) {
        const body: S3ObjectCreatedNotificationEvent = JSON.parse(record.body);
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
        console.log("Data inserted into DynamoDB", records.length);
    } catch (error) {
        console.error("Error inserting data into DynamoDB:", error);
        throw error;
    }
};
