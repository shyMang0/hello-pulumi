export const sqsEventData = {
    Records: [
        {
            messageId: "1",
            receiptHandle: "MessageReceiptHandle",
            body: JSON.stringify({
                eventVersion: "2.1",
                eventSource: "aws:s3",
                awsRegion: "us-east-1",
                eventTime: "2021-05-22T00:17:47.455Z",
                eventName: "ObjectCreated:Put",
                detail: {
                    s3SchemaVersion: "1.0",
                    configurationId: "828aa6fc-f7b5-4305-8584-487c791949c1",
                    bucket: {
                        name: "dcc-bucket-a5489b1",
                        ownerIdentity: {
                            principalId: "A3NL1KOZZKExample",
                        },
                        arn: "arn:aws:s3:::mybucket",
                    },
                    object: {
                        key: "generated (1).jsonxxx",
                        size: 1024,
                        eTag: "d41d8cd98f00b204e9800998ecf8427e",
                        sequencer: "0A1B2C3D4E5F678901",
                    },
                },
            }),
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
