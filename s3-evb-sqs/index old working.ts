import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("mrge-bucket");

// Connect the S3 bucket to EventBridge
const bucketNotification = new aws.s3.BucketNotification("bucketNotification", {
    bucket: bucket.id,
    eventbridge : true
});

// Create an AWS resource (SQS Queue)
const queue = new aws.sqs.Queue("mrge-queue");

// Create an IAM role for the EventBridge rule
const role = new aws.iam.Role("mrge-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Principal: {
                    Service: "events.amazonaws.com",
                },
                Effect: "Allow",
            },
        ],
    }),
});

// Attach a policy to the role that allows 'sqs:SendMessage'
const policy = new aws.iam.RolePolicy("my-policy", {
    role: role.id,
    policy: queue.arn.apply(arn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Action: "sqs:SendMessage",
                Resource: arn,
            },
        ],
    })),
});

// Create an AWS resource (EventBridge Rule)
const rule = new aws.cloudwatch.EventRule("mrge-rule", {
    eventPattern: bucket.bucket.apply(bucketName => JSON.stringify({
        "source": [
            "aws.s3"
        ],
        "detail-type": [
            "Object Created"
        ],
        "detail": {
            "bucket": {
                "name" : [ bucketName ]
            }
        }
    })),
});

// Create a resource-based policy for the SQS queue
const queuePolicy = new aws.sqs.QueuePolicy("mrge-queue-policy", {
    queueUrl: queue.url,
    policy: {
        Version: "2012-10-17",
        Id: "MyQueuePolicy",
        Statement: [{
            Sid: "Allow-SendMessage-From-EventBridge",
            Effect: "Allow",
            Principal: {
                Service: "events.amazonaws.com",
            },
            Action: "sqs:SendMessage",
            Resource: queue.arn,
        }],
    },
});

// Set the SQS queue as the target for the EventBridge rule
const target = new aws.cloudwatch.EventTarget("mrge-target", {
    rule: rule.name,
    arn: queue.arn,
}, { dependsOn: [queuePolicy] });

// Export the names of the created resources
export const bucketName = bucket.bucket;
export const queueUrl = queue.url;
export const ruleName = rule.name;