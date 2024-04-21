import { handler } from "../lambdaSqs/index";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { s3Readfile } from "../lambdaSqs/functions";
import { mockSqsEvent } from "./event-data";

jest.mock("@aws-sdk/lib-dynamodb", () => {
    return {
        DynamoDBDocumentClient: {
            from: jest.fn().mockReturnValue({
                send: jest.fn().mockResolvedValue({}),
            }),
        },
        BatchWriteCommand: jest.fn().mockImplementation(() => {
            return {
                send: jest.fn().mockResolvedValue({}),
            };
        }),
    };
});

jest.mock("../lambdaSqs/functions", () => ({
    s3Readfile: jest.fn(),
    processRecord: jest.fn(),
}));

describe("handler", () => {
    it("should process SQS event", async () => {
        process.env.DYNAMO_TABLE_NAME = "testTable";

        const mockEvent = mockSqsEvent;

        const mockItem = {};
        (s3Readfile as jest.Mock).mockResolvedValue(mockItem);
        (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue({
            send: jest.fn().mockResolvedValue({}),
        });

        await handler(mockEvent);

        expect(DynamoDBDocumentClient.from).toHaveBeenCalledWith(expect.any(DynamoDBClient));
        expect(BatchWriteCommand).toHaveBeenCalled();
    });
});
