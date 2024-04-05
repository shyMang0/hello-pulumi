import * as aws from "@pulumi/aws";

export const group = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [{ protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] }],
});

export const server = new aws.ec2.Instance("web-server-www", {
    instanceType: "t2.micro",
    securityGroups: [group.name], // reference the group object above
    ami: "ami-c55673a0", // AMI for us-east-2 (Ohio)
    tags: { Name: "www-server" }, // name tag
});

export const bucket = new aws.s3.Bucket("mrge-bucket", {
    tags: {
        Name: "My bucket",
    },
});

export const BUCKET_NAME = bucket.bucket;

export const SERVER_URN = server.urn;
