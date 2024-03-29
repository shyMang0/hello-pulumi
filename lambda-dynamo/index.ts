import * as aws from "@pulumi/aws";
import * as lambdaSqs from "./lambdaSqs";
import * as lambdaStream from "./lambdaStream";

const sqsArn = "arn:aws:sqs:ap-southeast-1:211125474624:mrge-queue-cf6d537";

const lambdaFunctionSqs = new aws.lambda.CallbackFunction("mrge-lambdaDynamo", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: lambdaSqs.handler,
    timeout: 30,
    environment: {
        variables: {
            DYNAMO_TABLE_NAME: "mrge-table-8c7e63a", // Replace from output from 1st stack
        },
    },
});

const evMappingLambdaSqs = new aws.lambda.EventSourceMapping(
    "evMappingLambdaSqs",
    {
        eventSourceArn: sqsArn,
        functionName: lambdaFunctionSqs.name,
        batchSize: 1, //10 def Set the desired batch size
    }
);

const lambdaFunctionStream = new aws.lambda.CallbackFunction(
    "mrge-lambdaStream",
    {
        runtime: aws.lambda.Runtime.NodeJS20dX,
        callback: lambdaStream.handler,
        timeout: 30,
    }
);

const dynamoTable = new aws.dynamodb.Table("mrge-table", {
    attributes: [
        { name: "id", type: "S" },
        // { name: "name", type: "S" },
    ],
    hashKey: "id",
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
    readCapacity: 1,
    writeCapacity: 1,
});

const evMappingLambdaStream = new aws.lambda.EventSourceMapping(
    "evMappingLambdaStream",
    {
        eventSourceArn: dynamoTable.streamArn,
        functionName: lambdaFunctionStream.name,
        batchSize: 1,
        startingPosition: "LATEST",
    }
);

const snsTopic = new aws.sns.Topic("mrge-topic", {
    displayName: "MRGE Topic to email",
});

const emailSubscription = new aws.sns.TopicSubscription("emailSubscription", {
    topic: snsTopic.arn,
    protocol: "email",
    endpoint: "carinodrex@gmail.com",
    // filterPolicy: {
    //     body: ["success"]
    // }
});

export const lambdaSqsArn = lambdaFunctionSqs.arn;
export const snsTopicArn = snsTopic.arn;
export const lambdaStreamArn = lambdaFunctionStream.arn;
