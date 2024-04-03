import { DynamoDBClient, WriteRequest } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, BatchWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { SQSEvent, S3ObjectCreatedNotificationEvent } from "aws-lambda";
import { readfile } from "./readfile";

export const handler = async (event: SQSEvent): Promise<any> => {
    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const tableName = process.env.DYNAMO_TABLE_NAME as string;

    const records = event.Records;
    console.log("SQS Data : ", records.length, JSON.stringify(records, null, 2));

    const params: BatchWriteCommandInput = {
        RequestItems: {
            [tableName]: [] as WriteRequest[],
        },
    };

    //LOOP METHOD, APPEND
    if (!params.RequestItems) params.RequestItems = {};
    for (const record of records) {
        const s3Obj: S3ObjectCreatedNotificationEvent = JSON.parse(record.body);
        const bucketName = s3Obj.detail.bucket.name;
        const fileName = s3Obj.detail.object.key;
        const jsonVal = await readfile(bucketName, fileName);
        params.RequestItems[tableName].push({
            PutRequest: {
                Item: {
                    id: record.messageId,
                    filename: fileName,
                    json: jsonVal,
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

    //=========== MAP METHOD
    // const params: BatchWriteCommandInput = {
    //     RequestItems: {
    //         [tableName]: records.map((record) => {
    //             const body: S3ObjectCreatedNotificationEvent = JSON.parse(record.body);
    //             return {
    //                 PutRequest: {
    //                     Item: {
    //                         id: body.detail.object.etag,
    //                         filename: body.detail.object.key,
    //                     },
    //                 },
    //             };
    //         }),
    //     },
    // };
};
