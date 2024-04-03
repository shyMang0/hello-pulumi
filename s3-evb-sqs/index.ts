import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("mrge-bucket");

// Connect the S3 bucket to EventBridge
const bucketNotification = new aws.s3.BucketNotification("mrge-bucket-notification", {
    bucket: bucket.id,
    eventbridge: true,
});

const queue = new aws.sqs.Queue("mrge-queue", {
    // delaySeconds: 5,
    // receiveWaitTimeSeconds: 5,
});

const rule = new aws.cloudwatch.EventRule("mrge-rule", {
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
const target = new aws.cloudwatch.EventTarget("mrge-target", {
    rule: rule.name,
    arn: queue.arn,
});

// Grant EventBridge permission to send messages to the SQS queue
const sqsPolicy = new aws.sqs.QueuePolicy("mrge-policy", {
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

export const BUCKET_NAME = bucket.bucket;
// export const queueUrl = queue.url;
export const SQS_ARN = queue.arn;
