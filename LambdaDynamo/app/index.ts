import * as aws from "@pulumi/aws";
export async function handleDocument(event: aws.sqs.QueueEvent): Promise<void> {
    console.log("wa");
    // Your lambda code here.
}
