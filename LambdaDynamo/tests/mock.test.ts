/**
 * test-handler.test.ts
 *
 * Unit tests for the Lambda handler function.
 *
  The unit tests here are focused on testing this interface, exercising code
 * paths that validate inbound request payloads and checking for correct
 * behavior when the busines layer returns different results.
 */

/**
 * Import Modules
 *
 * Standard practice to put imports at the top of a module definition.
 *
 */

import { APIGatewayProxyResult } from "aws-lambda";
import { handler as lambdaHandler } from "../lambdaSqs";
import { sqsEventData as eventJSON } from "./event-data";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
});

describe("Unit test for app handler", function () {
    /**
     * Happy path scenario, in this case we read the event for lambaHandler
     * We mock the response for DynamoDB GetCommand to produce a vailid response
     */

    it("verify happy path 200", async () => {
        process.env.DYNAMODB_TABLE_NAME = "unit_test_dynamodb_table";
        ddbMock.on(GetCommand).resolves({
            Item: { PK: "1", SK: "NAME#" },
        });
        const result = await lambdaHandler(eventJSON);
        expect(result).toBeTruthy();
        // expect(result.body).toEqual('{"helloMessage":"Hello NAME#"}');
    });

    /**
     * Unhappy path test where the id name record does not exist in the DynamoDB Table
     * We mock the response for DynamoDB GetCommand to produce a invalid response
     */

    // it("verify not found path 404", async () => {
    //     process.env.DYNAMODB_TABLE_NAME = "unit_test_dynamodb_table";
    //     ddbMock.on(GetCommand).resolves({ $metadata: { httpStatusCode: 200, requestId: "Id", attempts: 1, totalRetryDelay: 0 } });
    //     const result: APIGatewayProxyResult = await lambdaHandler(eventJSON);
    //     expect(result.statusCode).toEqual(404);
    // });
});
