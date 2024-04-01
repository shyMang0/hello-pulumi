import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event: any = {}): Promise<any> => {
    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const tableName = process.env.DYNAMO_TABLE_NAME;

    const records = event.Records; //is an array, can be a batch so for loop
    console.log("All Event Data : ", records);
    for (const record of records) {
        const body = JSON.parse(record.body);
        console.log("lambdaSqs SQS AHOYYY", JSON.stringify(body, null, 2));
        console.log("FILENAME : ", body.detail.object.key);
        console.log("Buket : ", body.detail.bucket.name);

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
        });

        const params = {
            TableName: tableName,
            Item: {
                id: "value : " + formattedDate,
                name: "filename : " + body.detail.object.key,
            },
        };

        try {
            await dynamoDB.send(new PutCommand(params));

            console.log("Data inserted into DynamoDB");
        } catch (error) {
            console.error("Error inserting data into DynamoDB:", error);
            throw error;
        }
    }
};
