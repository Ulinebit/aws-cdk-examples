#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Stack, Tags } from 'aws-cdk-lib';
import { DmsCdkStack } from '../lib/stacks/dms-cdk-stack';
// import { CustomStackSynthesizer } from '../lib/synthesizer/custom-synthesizer';

const app = new cdk.App();

const tags = app.node.tryGetContext("tags");

export function addTags(stack: Stack): void {
  for (const [key, value] of Object.entries(tags)) {
    Tags.of(stack).add(`${key}`, `${value as string}`);
  }
}

const dms_stack = new DmsCdkStack(app, 'DmsCdkStack', {
  stackName: `dms-cdkv2-dev`,
  env: {
    account: '962689519170',
    region: 'us-east-1'
  }
});

addTags(dms_stack);


app.synth()