import * as pulumi from "@pulumi/pulumi";
import "jest";

pulumi.runtime.setMocks(
    {
        newResource: function (args: pulumi.runtime.MockResourceArgs): { id: string; state: any } {
            return {
                id: args.inputs.name + "_id",
                state: args.inputs,
            };
        },
        call: function (args: pulumi.runtime.MockCallArgs) {
            return args.inputs;
        },
    },
    "project",
    "stack",
    false // Sets the flag `dryRun`, which indicates if pulumi is running in preview mode.
);

describe("Infrastructure", function () {
    let infra: typeof import("../infra");

    beforeAll(async function () {
        infra = await import("../infra");
    });

    describe("#dynamo", function () {
        it("must be initialized", function (done) {
            pulumi.all([infra.INFRA_TEST.dynamoUrn]).apply(([val]) => {
                if (!val) {
                    done(new Error(`no DynamoDb Urn`));
                } else {
                    done();
                }
            });
        });
    });

    // describe("#sns", function () {
    //     it("must be initialized", function (done) {
    //         pulumi.all([infra.INFRA_TEST.snsTopicUrn]).apply(([val]) => {
    //             if (!val) {
    //                 done(new Error(`no snsTopic Urn`));
    //             } else {
    //                 done();
    //             }
    //         });
    //     });

    //     it("subscriptionEmail must enabled", function (done) {
    //         pulumi.all([infra.INFRA_TEST.subscriptionEmailUrn]).apply(([val]) => {
    //             if (!val) {
    //                 done(new Error(`subscriptionEmail not enabled`));
    //             } else {
    //                 done();
    //             }
    //         });
    //     });
    // });

    // describe("#Lambda", function () {
    //     it("lambdaSqs must be initialized", function (done) {
    //         pulumi.all([infra.INFRA_TEST.lambdaSqsUrn]).apply(([val]) => {
    //             if (!val) {
    //                 done(new Error(`no lambdaSqs Urn`));
    //             } else {
    //                 done();
    //             }
    //         });
    //     });

    //     it("lambdaStream must be initialized", function (done) {
    //         pulumi.all([infra.INFRA_TEST.lambdaStreamUrn]).apply(([val]) => {
    //             if (!val) {
    //                 done(new Error(`no lambdaStream Urn`));
    //             } else {
    //                 done();
    //             }
    //         });
    //     });
    // });
});
