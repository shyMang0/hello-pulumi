import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3ObjectCreatedNotificationEvent, SQSEvent } from "aws-lambda";

export async function processRecord(record: SQSEvent["Records"][0]) {
    const s3Obj: S3ObjectCreatedNotificationEvent = JSON.parse(record.body);
    const bucketName = s3Obj.detail.bucket.name;
    const fileName = s3Obj.detail.object.key;
    const jsonVal = await s3Readfile(bucketName, fileName);

    //testing for DLQ
    if (!["green", "brown", "blue"].includes(jsonVal.eyeColor)) {
        throw new Error("Error to force to DLQ - Color detected : " + jsonVal.eyeColor);
    }

    return {
        PutRequest: {
            Item: {
                id: record.messageId,
                filename: fileName,
                json: jsonVal,
            },
        },
    };
}

export async function s3Readfile(bucketName: string, fileName: string): Promise<any> {
    const client = new S3Client({});
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });
    console.log("READ readfile", bucketName, fileName);
    try {
        const res = await client.send(command);
        const fileStr = await res.Body?.transformToString();
        if (!fileStr) throw new Error("File is empty");
        return toJson(fileStr);
    } catch (err) {
        console.error(err);
    }
}

function toJson(str: string | undefined) {
    if (!str) throw new Error("File is empty");
    try {
        return JSON.parse(str);
    } catch (e) {
        throw new Error("Invalid JSON file");
    }
}
