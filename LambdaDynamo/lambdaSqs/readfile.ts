import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function readfile(bucketName: string, fileName: string): Promise<any> {
    const client = new S3Client({});
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    try {
        const res = await client.send(command);
        const fileStr = await res.Body?.transformToString();
        // if (!fileStr) throw new Error("File is empty");
        console.log("READ FROM BUCKET", fileStr);
        return toJson(fileStr);
    } catch (err) {
        console.error(err);
    }
}

function toJson(str: string | undefined) {
    if (!str) throw new Error("File is empty");
    try {
        return JSON.parse(str);
        // return true;
    } catch (e) {
        throw new Error("Invalid JSON file");
    }
}
