import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event: any = {}): Promise<any> => {
    console.log("lambdaSqs HELLOW", JSON.stringify(event, null, 2));

    // Create an instance of the DynamoDB DocumentClient
    const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    // Define the parameters for the put operation
    const params = {
        TableName: "mrge-table-dab4557", // Replace with your actual table name
        Item: {
            // Specify the attributes of the item you want to insert
            id: "value1 : " + Date.now(),
            name: "value2",
            // ...
        },
    };

    try {
        // Call the put method to insert the item into DynamoDB
        await dynamoDB.send(new PutCommand(params));

        // Return a success response
        console.log("Data inserted into DynamoDB");

        // return {
        //     statusCode: 200,
        //     body: JSON.stringify("Data inserted into DynamoDB"),
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // };
    } catch (error) {
        // Handle any errors that occur during the put operation
        console.error("Error inserting data into DynamoDB:", error);
        throw error;
    }
};
