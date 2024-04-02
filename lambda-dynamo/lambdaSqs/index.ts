import { DynamoDBClient, WriteRequest } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, BatchWriteCommandInput } from "@aws-sdk/lib-dynamodb";

import { SQSEvent, S3ObjectCreatedNotificationEvent } from "aws-lambda";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const handler = async (event: SQSEvent): Promise<any> => {
    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const tableName = process.env.DYNAMO_TABLE_NAME as string;

    const records = event.Records;
    console.log("SQS Data : ", records.length, JSON.stringify(records, null, 2));

    //LOOP METHOD, APPEND
    const params: BatchWriteCommandInput = {
        RequestItems: {
            [tableName]: [] as WriteRequest[],
        },
    };

    if (!params.RequestItems) params.RequestItems = {};
    const client = new S3Client({});

    for (const record of records) {
        const s3Obj: S3ObjectCreatedNotificationEvent = JSON.parse(record.body);
        const bucketName = s3Obj.detail.bucket.name;
        const fileName = s3Obj.detail.object.key;
        //open json file
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        });
        try {
            const response = await client.send(command);
            // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
            const str = await response.Body?.transformToString();
            console.log("READ FROM BUCKET", str);
        } catch (err) {
            console.error(err);
        }

        //append
        params.RequestItems[tableName].push({
            PutRequest: {
                Item: {
                    id: bucketName,
                    filename: fileName,
                },
            },
        });
    }

    // MAP METHOD
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
    try {
        await dynamoDB.send(new BatchWriteCommand(params));
        console.log("Data inserted into DynamoDB", records.length);
    } catch (error) {
        console.error("Error inserting data into DynamoDB:", error);
        throw error;
    }
};
