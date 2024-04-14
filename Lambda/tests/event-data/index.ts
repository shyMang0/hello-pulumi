import { SQSEvent } from "aws-lambda";

export const mockSqsEvent: SQSEvent = {
    Records: [
        {
            receiptHandle: "MessageReceiptHandle",
            body: JSON.stringify({
                detail: {
                    bucket: { name: "testBucket" },
                    object: { key: "testKey" },
                },
            }),
            messageId: "testMessageId",
            attributes: {
                ApproximateFirstReceiveTimestamp: "1573251510774",
                SenderId: "AIDAIENQZJOLO23YVJ4VO",
                SentTimestamp: "1573251510774",
                ApproximateReceiveCount: "1",
            },
            messageAttributes: {},
            md5OfBody: "098f6bcd4621d373cade4e832627b4f6",
            eventSource: "aws:sqs",
            eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:MyQueue",
            awsRegion: "us-east-1",
        },
    ],
};
