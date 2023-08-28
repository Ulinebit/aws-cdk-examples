import { DefaultStackSynthesizer } from "aws-cdk-lib";

export class CustomStackSynthesizer extends DefaultStackSynthesizer {
  public static readonly QUALIFIER = 'cdkv2';

  constructor(){
    super({
      qualifier: CustomStackSynthesizer.QUALIFIER,
      deployRoleArn: `arn:\${AWS::Partition}:iam::\${AWS::AccountId}:role/delegate-admin-${CustomStackSynthesizer.QUALIFIER}-dr-\${AWS::Region}`,
      fileAssetPublishingRoleArn: `arn:\${AWS::Partition}:iam::\${AWS::AccountId}:role/delegate-admin-${CustomStackSynthesizer.QUALIFIER}-fpr-\${AWS::Region}`,
      cloudFormationExecutionRole: `arn:\${AWS::Partition}:iam::\${AWS::AccountId}:role/delegate-admin-${CustomStackSynthesizer.QUALIFIER}-cer-\${AWS::Region}`,
      imageAssetPublishingRoleArn: `arn:\${AWS::Partition}:iam::\${AWS::AccountId}:role/delegate-admin-${CustomStackSynthesizer.QUALIFIER}-ipr-\${AWS::Region}`,
      lookupRoleArn: `arn:\${AWS::Partition}:iam::\${AWS::AccountId}:role/delegate-admin-${CustomStackSynthesizer.QUALIFIER}-lr-\${AWS::Region}`,
    });
  }
}