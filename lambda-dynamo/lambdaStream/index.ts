import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export const handler = async (event: any = {}): Promise<any> => {
    console.log("lambdaStream STREAM AHOYYY", JSON.stringify(event, null, 2));

    // Create an instance of the SNS client
    const sns = new SNSClient();

    try {
        // await sns.send(new PublishCommand(params));
        await sns.send(
            new PublishCommand({
                Subject: "subject from lambda",
                Message: "Hello from Lambda!",
                TopicArn: "arn:aws:sns:ap-southeast-1:211125474624:test-topic",
            })
        );
        console.log("Message published successfully");
    } catch (error) {
        console.error("Failed to publish message", error);
    }

    // Rest of your code...

    // return {
    //   statusCode: 200,
    //   body: JSON.stringify('Hello from Lambda! Updated Drex again'),
    //   headers: {
    //       'Content-Type': 'application/json'
    //   }
    // };
};
