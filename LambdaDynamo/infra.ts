import * as aws from "@pulumi/aws";
// import { handler as lambdaSqsHandler } from "./lambdaSqs";
// import { handler as lambdaStreamHandler } from "./lambdaStream";
import * as pulumi from "@pulumi/pulumi";
import { DynamoDBStreamEvent } from "aws-lambda";

// const stackA = new pulumi.StackReference("shyMang0/BucketSqs/dev");
// const SQS_ARN = stackA.getOutput("SQS_ARN");
const SQS_ARN = "arn:aws:sqs:us-east-1:123456789012:mrge-queue";

export const dynamoTable = new aws.dynamodb.Table("mrge-table", {
    attributes: [{ name: "id", type: "S" }],
    hashKey: "id",
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
    readCapacity: 1,
    writeCapacity: 1,
});

// NEW LAMBDA FOR SQS
export const lambdaSqs = new aws.lambda.CallbackFunction("mrge-lambda-sqs", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: async (event, context) => {
        return true;
        // Your callback logic here
    },
    timeout: 30,
    environment: {
        variables: {
            DYNAMO_TABLE_NAME: dynamoTable.name, //referenced from output from 1st stack
        },
    },
});

export const INFRA_TEST = {
    dynamoUrn: "oks",
};
