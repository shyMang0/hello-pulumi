import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event: any = {}): Promise<any> => {
    console.log("lambdaSqs HELLOW", JSON.stringify(event, null, 2));

    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const tableName = process.env.DYNAMO_TABLE_NAME;

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
            id: "value1 : " + formattedDate,
            name: "value2",
        },
    };

    try {
        // Call the put method to insert the item into DynamoDB
        await dynamoDB.send(new PutCommand(params));

        // Return a success response
        console.log("Data inserted into DynamoDB");
    } catch (error) {
        // Handle any errors that occur during the put operation
        console.error("Error inserting data into DynamoDB:", error);
        throw error;
    }
};
