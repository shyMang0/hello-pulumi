import { DynamoDBClient, WriteRequest } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, BatchWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { SQSEvent, S3ObjectCreatedNotificationEvent, SQSBatchItemFailure, SQSBatchResponse, Context } from "aws-lambda";
import { s3Readfile, processRecord } from "./functions";

export const handler = async (event: SQSEvent, context: Context): Promise<SQSBatchResponse> => {
    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const tableName = process.env.DYNAMO_TABLE_NAME as string;
    const records = event.Records;

    let batchItemFailures: SQSBatchItemFailure[] = records.map((record) => ({ itemIdentifier: record.messageId }));
    console.log("SQS Data : ", records.length, JSON.stringify(records, null, 2));

    const params: BatchWriteCommandInput = {
        RequestItems: {
            [tableName]: [] as WriteRequest[],
        },
    };

    //LOOP METHOD, APPEND
    if (!params.RequestItems) params.RequestItems = {};
    for (const record of records) {
        try {
            const pushValue = await processRecord(record);
            params.RequestItems[tableName].push(pushValue);
            //remove the item from batchItemFailures
            batchItemFailures = batchItemFailures.filter((item) => item.itemIdentifier !== record.messageId);
        } catch (error) {
            console.error("Error processing record should return batchItemFailures", error);
            // batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    if (!params.RequestItems[tableName].length) return { batchItemFailures };

    try {
        await dynamoDB.send(new BatchWriteCommand(params));
        console.log("Data inserted into DynamoDB", records.length - batchItemFailures.length);
        return { batchItemFailures };
    } catch (error) {
        console.error("Error inserting data into DynamoDB:", error);
        return { batchItemFailures };
    }
};
