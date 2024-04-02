import * as aws from "@pulumi/aws";
import * as lambdaSqs from "./lambdaSqs";
import * as lambdaStream from "./lambdaStream";
import * as pulumi from "@pulumi/pulumi";

const stackA = new pulumi.StackReference("shyMang0/s3-evb-sqs/dev");
const sqsArn = stackA.getOutput("sqsArn");

const dynamoTable = new aws.dynamodb.Table("mrge-table", {
    attributes: [{ name: "id", type: "S" }],
    hashKey: "id",
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
    readCapacity: 1,
    writeCapacity: 1,
});

// NEW LAMBDA FOR SQS
const lambdaFunctionSqs = new aws.lambda.CallbackFunction("mrge-lambdaSqs", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: lambdaSqs.handler,
    timeout: 30,
    environment: {
        variables: {
            DYNAMO_TABLE_NAME: dynamoTable.name, //referenced from output from 1st stack
        },
    },
});
// MAP SQS EVENT TO LAMBDA
const evMappingLambdaSqs = new aws.lambda.EventSourceMapping("evMappingLambdaSqs", {
    eventSourceArn: sqsArn,
    functionName: lambdaFunctionSqs.name,
    batchSize: 5,
    // maximumBatchingWindowInSeconds: 2,
});

//NEW SNS TOPIC
const snsTopic = new aws.sns.Topic("mrge-topic", {
    displayName: "MRGE Topic to email",
});
// SUBSCRIPTION EMAIL TYPE
const emailSubscription = new aws.sns.TopicSubscription("emailSubscription", {
    topic: snsTopic.arn,
    protocol: "email",
    endpoint: "carinodrex@gmail.com",
});

// NEW LAMBDA FOR DYNA STREAM to SNS
const lambdaFunctionStream = new aws.lambda.CallbackFunction("mrge-lambdaStream", {
    runtime: aws.lambda.Runtime.NodeJS20dX,
    callback: lambdaStream.handler,
    timeout: 30,
    environment: {
        variables: {
            TOPIC_ARN: snsTopic.arn, // output from 1st stack
        },
    },
});

//to the lambda role attach AmazonSNSFullAccess policy
const lambdaRole = lambdaFunctionStream?.roleInstance?.name.apply((role) => {
    const policy = new aws.iam.RolePolicy("lambda-sns-policy", {
        role: role,
        policy: {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Action: "sns:Publish",
                    Resource: snsTopic.arn,
                },
            ],
        },
    });
    return role;
});

// MAP DYNAMO STREAM EVENT TO LAMBDA
const evMappingLambdaStream = new aws.lambda.EventSourceMapping("evMappingLambdaStream", {
    eventSourceArn: dynamoTable.streamArn,
    functionName: lambdaFunctionStream.name,
    batchSize: 5,
    maximumBatchingWindowInSeconds: 2,
    startingPosition: "LATEST",
    filterCriteria: {
        filters: [
            {
                pattern: '{ "eventName" : ["INSERT"] }',
            },
        ],
    },
});

export const snsTopicArn = snsTopic.arn;
export const lambdaStream2 = lambdaFunctionStream.arn;
export const lambdaSqs1 = lambdaFunctionSqs.arn;
export const receivedSqsArn = sqsArn;
