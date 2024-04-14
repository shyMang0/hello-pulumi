import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("dcc-bucket");

// Connect the S3 bucket to EventBridge
const bucketNotification = new aws.s3.BucketNotification("dcc-bucket-notification", {
    bucket: bucket.id,
    eventbridge: true,
    // important to to enable eventbridge
});

// Create an SQS queue
const queue = new aws.sqs.Queue("dcc-queue", {
    // delaySeconds: 5,
    // receiveWaitTimeSeconds: 5,
});

// Create an EventBridge rule that triggers on S3 bucket file uploads only
const rule = new aws.cloudwatch.EventRule("dcc-rule", {
    eventPattern: bucket.bucket.apply((bucketName) =>
        JSON.stringify({
            source: ["aws.s3"],
            "detail-type": ["Object Created"],
            detail: {
                bucket: {
                    name: [bucketName],
                },
            },
        })
    ),
});

// Set the SQS queue as the target for the EventBridge rule
const target = new aws.cloudwatch.EventTarget("dcc-target", {
    rule: rule.name,
    arn: queue.arn,
});

// Grant EventBridge permission to send messages to the SQS queue
const sqsPolicy = new aws.sqs.QueuePolicy("dcc-policy", {
    queueUrl: queue.id,
    policy: {
        Version: "2012-10-17",
        Id: queue.arn.apply((arn) => `${arn}/SQSDefaultPolicy`),
        Statement: [
            {
                Sid: "Allow-EventBridge",
                Effect: "Allow",
                Principal: "*",
                Action: "sqs:SendMessage",
                Resource: queue.arn,
                Condition: {
                    ArnEquals: {
                        "aws:SourceArn": rule.arn,
                    },
                },
            },
        ],
    },
});

// Create a DynamoDB table
// enable stream to capture changes, NEW_IMAGE only
const dynamoTable = new aws.dynamodb.Table("dcc-table", {
    attributes: [{ name: "id", type: "S" }],
    hashKey: "id",
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
    readCapacity: 1,
    writeCapacity: 1,
});

// Create an SNS topic
const snsTopic = new aws.sns.Topic("dcc-topic", {
    displayName: "DccTest Topic to email",
});
// Create an SNS subscription to email
const subscriptionEmail = new aws.sns.TopicSubscription("subscription-email", {
    topic: snsTopic.arn,
    protocol: "email",
    endpoint: "carinodrex.ext@gmail.com",
});

export const BUCKET_NAME = bucket.bucket;
export const SQS_ARN = queue.arn;
export const DYNAMO_NAME = dynamoTable.name;
export const DYNAMO_STREAMARN = dynamoTable.streamArn;
export const SNSTOPIC_ARN = snsTopic.arn;
export const INFRA_TEST = {
    bucketUrn: bucket.urn,
    bucketNotificationEvBridge: bucketNotification.eventbridge,
    sqsUrn: queue.urn,
    targetUrn: target.urn,
    sqsPolicyUrn: sqsPolicy.urn,
};
