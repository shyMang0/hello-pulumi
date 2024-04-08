import * as aws from "@pulumi/aws";
import { handler as lambdaSqsHandler } from "./lambdaSqs";
import { handler as lambdaStreamHandler } from "./lambdaStream";
import * as pulumi from "@pulumi/pulumi";
import { DynamoDBStreamEvent } from "aws-lambda";

// const stackA = new pulumi.StackReference("shyMang0/BucketSqs/dev");
// const SQS_ARN = stackA.getOutput("SQS_ARN");
const SQS_ARN = "arn:aws:sqs:us-east-1:123456789012:dcc-queue";

const dynamoTable = new aws.dynamodb.Table("dcc-table", {
    attributes: [{ name: "id", type: "S" }],
    hashKey: "id",
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
    readCapacity: 1,
    writeCapacity: 1,
});

// NEW LAMBDA FOR SQS
const lambdaSqs = new aws.lambda.CallbackFunction("dcc-lambda-sqs", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: lambdaSqsHandler,
    timeout: 30,
    environment: {
        variables: {
            DYNAMO_TABLE_NAME: dynamoTable.name, //referenced from output from 1st stack
        },
    },
});
// MAP SQS EVENT TO LAMBDA
const lambdaTriggerSqs = new aws.lambda.EventSourceMapping("lambda-trigger-sqs", {
    eventSourceArn: SQS_ARN,
    functionName: lambdaSqs.name,
    batchSize: 5,
    maximumBatchingWindowInSeconds: 3,
    scalingConfig: {
        maximumConcurrency: 2,
        //limits to 2 concurrent executions
        //to maximum 5 messages per batch
        //the default has 5 concurrent executions
    },
});

const snsTopic = new aws.sns.Topic("dcc-topic", {
    displayName: "DccTest Topic to email",
});
const subscriptionEmail = new aws.sns.TopicSubscription("subscription-email", {
    topic: snsTopic.arn,
    protocol: "email",
    endpoint: "carinodrex.ext@gmail.com",
});

// NEW LAMBDA FOR DYNA STREAM to SNS
const lambdaStream = new aws.lambda.CallbackFunction("dcc-lambda-stream", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: lambdaStreamHandler,
    timeout: 30,
    environment: {
        variables: {
            TOPIC_ARN: snsTopic.arn, // output from 1st stack
        },
    },
});

//to the lambda role attach AmazonSNSFullAccess policy
let lambdaRole: any;
// lambdaRole = lambdaStream?.roleInstance?.name.apply((role: any) => {
//     const policy = new aws.iam.RolePolicy("lambda-sns-policy", {
//         role: role,
//         policy: {
//             Version: "2012-10-17",
//             Statement: [
//                 {
//                     Effect: "Allow",
//                     Action: "sns:Publish",
//                     Resource: snsTopic.arn,
//                 },
//             ],
//         },
//     });
//     return role;
// });

// MAP DYNAMO STREAM EVENT TO LAMBDA
const lambdaTriggerStream = new aws.lambda.EventSourceMapping("lambda-trigger-stream", {
    eventSourceArn: dynamoTable.streamArn,
    functionName: lambdaStream.name,
    batchSize: 5,
    maximumBatchingWindowInSeconds: 5,
    startingPosition: "LATEST",
    filterCriteria: {
        //reduce lambda triggering by filtering only INSERT events
        filters: [
            {
                pattern: '{ "eventName" : ["INSERT"] }',
            },
        ],
    },
});

export const PARAMETER_SQS_ARN = SQS_ARN;
export const TOPIC_ARN = snsTopic.arn;
export const LAMBDA_SQS = lambdaSqs.arn;
export const LAMBDA_STREAM = lambdaStream.arn;

export const INFRA_TEST = {
    dynamoUrn: dynamoTable.urn,
    lambdaTriggerSqsUrn: lambdaTriggerSqs.urn,
    snsTopicUrn: snsTopic.urn,
    lambdaTriggerStreamUrn: lambdaTriggerStream.urn,
    lambdaSqsUrn: lambdaSqs.urn,
    lambdaStreamUrn: lambdaStream.urn,
    subscriptionEmailUrn: subscriptionEmail.urn,
};
