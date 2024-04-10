import { handler } from "../lambdaSqs"; // import your lambda handler
import AWS from "aws-sdk";
import { SQSEvent } from "aws-lambda";

// Mock AWS SDK
jest.mock("aws-sdk", () => {
    const mockedS3 = { getObject: jest.fn() };
    const mockedDynamoDB = { put: jest.fn() };
    return {
        S3: jest.fn(() => mockedS3),
        DynamoDB: jest.fn(() => mockedDynamoDB),
    };
});

describe("Lambda Test", () => {
    it("should get file from S3 and insert into DynamoDB", async () => {
        const event: SQSEvent = {
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
                                key: "generated (1).json",
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

        // Define what should be returned by the S3 getObject call
        AWS.S3.prototype.getObject = jest.fn().mockReturnValue({
            promise: () => Promise.resolve({ Body: "file content" }),
        });

        // Define what should be returned by the DynamoDB put call
        AWS.DynamoDB.DocumentClient.prototype.put = jest.fn().mockReturnValue({
            promise: () => Promise.resolve({}),
        });

        // Call the lambda handler
        const result = await handler(event);

        // Define your expected result
        const expectedResult = {}; // expected result

        // Expect the mock to have been called
        expect(AWS.S3.prototype.getObject).toHaveBeenCalled();
        expect(AWS.DynamoDB.DocumentClient.prototype.put).toHaveBeenCalled();

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });
});
