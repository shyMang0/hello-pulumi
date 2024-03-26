import * as aws from "@pulumi/aws";

// Create an S3 bucket
const bucket = new aws.s3.Bucket("my-bucket", {
    // Enable event notifications to EventBridge
    // eventBridgeEnabled: true,
});

// Connect the S3 bucket to EventBridge
const bucketNotification = new aws.s3.BucketNotification("bucketNotification", {
    bucket: bucket.id,
    eventbridge : true
});

// Create an SQS queue
const queue = new aws.sqs.Queue("my-queue");

// Create an EventBridge rule to match s3:ObjectCreated:* events
const rule = new aws.cloudwatch.EventRule("my-rule", {
    eventPattern: JSON.stringify({
        source: ["aws.s3"],
        detailType: ["Object Created"],
        detail: {
            bucket: {
                name: ['my-bucket-a224b8d'],//[bucket.id],
            },
        },
    }),
});

// Target the EventBridge rule to the SQS queue
const target = new aws.cloudwatch.EventTarget("my-target", {
    rule: rule.name,
    arn: queue.arn,
});

// Grant EventBridge the permission to send messages to the SQS queue
const permission = new aws.sqs.QueuePolicy("my-queue-policy", {
    queueUrl: queue.url,
    policy: queue.arn.apply(arn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: {
                Service: "events.amazonaws.com",
            },
            Action: "sqs:SendMessage",
            Resource: arn,
            Condition: {
                ArnEquals: { "aws:SourceArn": rule.arn },
            },
        }],
    })),
});

// Export the names and URLs of the created resources
export const bucketName = bucket.id;
export const queueUrl = queue.url;
export const queueArn = queue.arn;
export const ruleName = rule.name;