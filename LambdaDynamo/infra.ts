import * as aws from "@pulumi/aws";
// import { handler as lambdaSqsHandler } from "./lambdaSqs";
// import { handler as lambdaStreamHandler } from "./lambdaStream";
import * as pulumi from "@pulumi/pulumi";
// import { handleDocument } from "./app";
// import { Context, DynamoDBStreamEvent } from "aws-lambda";

// const stackA = new pulumi.StackReference("shyMang0/BucketSqs/dev");
// const SQS_ARN = stackA.getOutput("SQS_ARN");
const SQS_ARN = "arn:aws:sqs:us-east-1:123456789012:dcc-queue";

export const dynamoTable = new aws.dynamodb.Table("dcc-table", {
    attributes: [{ name: "id", type: "S" }],
    hashKey: "id",
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
    readCapacity: 1,
    writeCapacity: 1,
});

// const x = new aws.lambda.Function("myMockLambda", {
//     code: new pulumi.asset.AssetArchive({
//         "index.js": new pulumi.asset.StringAsset("exports.handler = " + lambdaSqsHandler.toString()),
//     }),

//     runtime: aws.lambda.Runtime.NodeJS20dX,
//     role: new aws.iam.Role("myMockRole", {
//         assumeRolePolicy: JSON.stringify({
//             Version: "2012-10-17",
//             Statement: [
//                 {
//                     Action: "sts:AssumeRole",
//                     Effect: "Allow",
//                     Principal: {
//                         Service: "lambda.amazonaws.com",
//                     },
//                 },
//             ],
//         }),
//     }).arn,
//     handler: "index.handler",
// });
const docsHandlerRole = new aws.iam.Role("docsHandlerRole", {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Principal: {
                    Service: "lambda.amazonaws.com",
                },
                Effect: "Allow",
            },
        ],
    },
});

const rolePolicy = new aws.iam.RolePolicyAttachment("x", {
    role: docsHandlerRole.id,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
});

// Next, create the Lambda function itself.
const docsHandlerFunc = new aws.lambda.Function("docsHandlerFunc", {
    runtime: "nodejs18.x",
    role: "",
    handler: "index.handler",

    // Upload the code for the Lambda from the "./app" directory.
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app"),
    }),
});
// NEW LAMBDA FOR SQS
// const lambdaSqs = new aws.lambda.CallbackFunction("dcc-lambda-sqs", {
//     // runtime: aws.lambda.Runtime.NodeJS18dX,
//     callback: async () => {
//         // return true;
//         // Your callback logic here
//     },
//     // timeout: 30,
//     // role: new aws.iam.Role("myMockRole", {
//     //     assumeRolePolicy: JSON.stringify({
//     //         Version: "2012-10-17",
//     //         Statement: [
//     //             {
//     //                 Action: "sts:AssumeRole",
//     //                 Effect: "Allow",
//     //                 Principal: {
//     //                     Service: "lambda.amazonaws.com",
//     //                 },
//     //             },
//     //         ],
//     //     }),
//     // }).arn,
//     // environment: {
//     //     variables: {
//     //         DYNAMO_TABLE_NAME: dynamoTable.name, //referenced from output from 1st stack
//     //     },
//     // },
// });

// const lamb = new aws.lambda.Function("myMockLambda", {
//     code: new pulumi.asset.AssetArchive({
//         "index.js": new pulumi.asset.StringAsset("exports.handler = " + handler.toString()),
//     }),
//     runtime: aws.lambda.Runtime.NodeJS20dX,
//     role: new aws.iam.Role("myMockRole", {
//         assumeRolePolicy: JSON.stringify({
//             Version: "2012-10-17",
//             Statement: [
//                 {
//                     Action: "sts:AssumeRole",
//                     Effect: "Allow",
//                     Principal: {
//                         Service: "lambda.amazonaws.com",
//                     },
//                 },
//             ],
//         }),
//     }).arn,
//     handler: "index.handler",
// });
// export const lambdaSqsx = aws.lambda.createFunctionFromEventHandler("dcc-lambda-sqs", lambdaSqsHandler);

export const INFRA_TEST = {
    dynamoUrn: "oks",
};
