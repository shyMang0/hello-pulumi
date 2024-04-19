import { SNSClient, PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import { DynamoDBStreamEvent } from "aws-lambda";

export const handler = async (event: DynamoDBStreamEvent): Promise<any> => {
    console.log("lambdaStream Data :", event.Records.length, JSON.stringify(event, null, 2));
    const TopicArn = process.env.TOPIC_ARN;

    const records = event.Records;
    let filenames = records.map((record) => record.dynamodb?.NewImage?.filename.S);

    try {
        await snsPublish({
            Subject: `SNS from Lambda with Stream Origin`,
            Message: `body => filenames : ${event.Records.length} - ${JSON.stringify(filenames)}`,
            TopicArn: TopicArn,
        });
        console.log("Message published successfully");
    } catch (error) {
        console.error("Failed to publish message", error);
    }
};

async function snsPublish(publishCmd: PublishCommandInput) {
    const sns = new SNSClient();
    await sns.send(new PublishCommand(publishCmd));
}
