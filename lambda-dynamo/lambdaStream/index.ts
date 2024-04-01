import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export const handler = async (event: any = {}): Promise<any> => {
    console.log("lambdaStream STREAM AHOYYY", JSON.stringify(event, null, 2));

    const sns = new SNSClient();

    try {
        await sns.send(
            new PublishCommand({
                Subject: "subject from lambda",
                Message: `Hello from Lambda! ${JSON.stringify(event.Records[0].dynamodb.NewImage)}`,
                TopicArn: "arn:aws:sns:ap-southeast-1:211125474624:test-topic",
            })
        );
        console.log("Message published successfully");
    } catch (error) {
        console.error("Failed to publish message", error);
    }
};
