import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

const bucket = new aws.s3.Bucket("bucket");


// The URL at which the REST API will be served.
export const url = bucket.arn;
