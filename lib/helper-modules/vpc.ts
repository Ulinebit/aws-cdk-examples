import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

// * VPC

export class MyVpc {
    public static getVpc(scope: Construct, id: string) {
        const vpcId = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-vpcid`, {
            parameterName: "/my/vpc/vpcid",
            version: 1,
        }).stringValue;
        
        const vpcCidr = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-vpccidr`, {
            parameterName: "/my/vpc/vpccidr",
            version: 1,
        }).stringValue;
        
        const privateSubnet1aid = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-privatesubnet1aid`, {
            parameterName: "/my/vpc/privatesubnet1aid",
            version: 1,
        }).stringValue;
        
        const privateSubnet1aRouteTable = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-privatesubnet1aroutetable`, {
            parameterName: "/my/vpc/privatesubnet2aid",
            version: 1,
        }).stringValue;
        const privateSubnet2aid = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-privatesubnet2aid`, {
            parameterName: "/my/vpc/vpccidr",
            version: 1,
        }).stringValue;
        
        const privateSubnet2aRouteTable = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-privatesubnet2aroutetable`, {
            parameterName: "/my/vpc/privatesubnet2aroutetable",
            version: 1,
        }).stringValue;
        
        const privateSubnet3aid = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-privatesubnet3aid`, {
            parameterName: "/my/vpc/privatesubnet3aid",
            version: 1,
        }).stringValue;
        
        const privateSubnet3aRouteTable = ssm.StringParameter.fromStringParameterAttributes(scope, `${id}-privatesubnet3aroutetable`, {
            parameterName: "/my/vpc/privatesubnet3aroutetable",
            version: 1,
        }).stringValue;
        return ec2.Vpc.fromVpcAttributes(scope, `${id}-default-vpc`, {
            vpcId: vpcId,
            vpcCidrBlock: vpcCidr,
            availabilityZones: cdk.Fn.getAzs(),
            privateSubnetIds: [
                privateSubnet1aid,
                privateSubnet2aid,
                privateSubnet3aid,
            ],
            privateSubnetRouteTableIds: [
                privateSubnet1aRouteTable,
                privateSubnet2aRouteTable,
                privateSubnet3aRouteTable
            ]
        });

    }
}
