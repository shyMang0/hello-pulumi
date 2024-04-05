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
    true // Sets the flag `dryRun`, which indicates if pulumi is running in preview mode.
);

describe("Infrastructure", function () {
    let infra: typeof import("../index");

    beforeAll(async function () {
        infra = await import("../index");
    });

    describe("#bucket", function () {
        it("must be initialized", function (done) {
            pulumi.all([infra.INFRA_TEST.bucketUrn]).apply(([bucketUrn]) => {
                // console.log("BUCKET urn in apply", bucketUrn);
                if (!bucketUrn) {
                    done(new Error(`no bucket Urn`));
                } else {
                    done();
                }
            });
        });

        it("Eventbridge must be enabled", function (done) {
            pulumi.all([infra.INFRA_TEST.sqsPolicyUrn]).apply(([sqsPolicyUrn]) => {
                if (!sqsPolicyUrn) {
                    done(new Error(`Eventbridge policy not enabled`));
                } else {
                    done();
                }
            });
        });

        it("eventbridge has send Message Policy", function (done) {
            pulumi.all([infra.INFRA_TEST.targetUrn]).apply(([targetUrn]) => {
                if (!targetUrn) {
                    done(new Error(`no Sqs Urn`));
                } else {
                    done();
                }
            });
        });
    });

    describe("#Sqs", function () {
        it("must be initialized", function (done) {
            pulumi.all([infra.INFRA_TEST.sqsUrn]).apply(([sqsUrn]) => {
                // console.log("BUCKET urn in apply", bucketUrn);
                if (!sqsUrn) {
                    done(new Error(`no Sqs Urn`));
                } else {
                    done();
                }
            });
        });

        it("s3 upload must target Sqs", function (done) {
            pulumi.all([infra.INFRA_TEST.targetUrn]).apply(([targetUrn]) => {
                if (!targetUrn) {
                    done(new Error(`no Sqs Urn`));
                } else {
                    done();
                }
            });
        });
    });
});
