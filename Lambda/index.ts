import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { handler as lambdaSqsHandler } from "./lambdaSqs";
import { handler as lambdaStreamHandler } from "./lambdaStream";
// import { DynamoDBStreamEvent } from "aws-lambda";

const stackA = new pulumi.StackReference("shyMang0/AwsInfra/dev");
const SQS_ARN = stackA.getOutput("SQS_ARN");
const DYNAMO_NAME = stackA.getOutput("DYNAMO_NAME");
const DYNAMO_STREAMARN = stackA.getOutput("DYNAMO_STREAMARN");
const SNSTOPIC_ARN = stackA.getOutput("SNSTOPIC_ARN");

// NEW LAMBDA FOR SQS
const lambdaSqs = new aws.lambda.CallbackFunction("dcc-lambda-sqs", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: lambdaSqsHandler,
    timeout: 30,
    environment: {
        variables: {
            DYNAMO_TABLE_NAME: DYNAMO_NAME, //referenced from output from 1st stack
        },
    },
});
// MAP SQS EVENT TO LAMBDA
const lambdaTriggerSqs = new aws.lambda.EventSourceMapping("lambda-trigger-sqs", {
    eventSourceArn: SQS_ARN,
    functionName: lambdaSqs.name,
    batchSize: 5,
    maximumBatchingWindowInSeconds: 3,
    functionResponseTypes: ["ReportBatchItemFailures"], // equivalent of reportBatchItemFailures: true,
    scalingConfig: {
        maximumConcurrency: 2,
        //limits to 2 concurrent executions
        //to maximum 5 messages per batch
        //the default has 5 concurrent executions
    },
});

// NEW LAMBDA FOR DYNA STREAM to SNS
const lambdaStream = new aws.lambda.CallbackFunction("dcc-lambda-stream", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: lambdaStreamHandler,
    timeout: 30,
    environment: {
        variables: {
            TOPIC_ARN: SNSTOPIC_ARN, // output from 1st stack
        },
    },
});

//to the lambda role attach AmazonSNSPublish policy
const lambdaRole = lambdaStream?.roleInstance?.name.apply((role: any) => {
    const policy = new aws.iam.RolePolicy("lambda-sns-policy", {
        role: role,
        policy: {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Action: "sns:Publish",
                    Resource: SNSTOPIC_ARN,
                },
            ],
        },
    });
    return role;
});

// MAP DYNAMO STREAM EVENT TO LAMBDA
const lambdaTriggerStream = new aws.lambda.EventSourceMapping("lambda-trigger-stream", {
    eventSourceArn: DYNAMO_STREAMARN,
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
export const TOPIC_ARN = SNSTOPIC_ARN;
export const LAMBDA_SQS = lambdaSqs.arn;
export const LAMBDA_STREAM = lambdaStream.arn;
