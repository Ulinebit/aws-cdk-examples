import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_dms as dms, StackProps } from 'aws-cdk-lib';
import { aws_secretsmanager as secrets } from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import * as truncate_settings from '../dms_settings/truncate_load_settings.json';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { MyVpc } from '../helper-modules/vpc';


export class DmsCdkStack extends cdk.Stack {
    constructor (scope: Construct, id: string, props?: StackProps){
        super(scope,id,props);

        // ***************** DMS Security Group **************

        const MyPrefixList: string = 'pl-123456789'

        const DmsSecurityGroup = new ec2.SecurityGroup(this, 'dms-sg', {
            securityGroupName: `dms-sg-dev`,
            description: 'DMS security group for RDS data sync',
            vpc: MyVpc.getVpc(this, 'myvpc')
        });

        DmsSecurityGroup.addIngressRule(
            ec2.Peer.prefixList(MyPrefixList),
            ec2.Port.tcp(5432)
        );

        // ******************** Subnets *********************

        const subnetIdA: string = ssm.StringParameter.valueForStringParameter(this, '/vpc/privatesubnet1aid');
        const subnetIdB: string = ssm.StringParameter.valueForStringParameter(this, '/vpc/privatesubnet2aid');
        const subnetIdC: string = ssm.StringParameter.valueForStringParameter(this, '/vpc/privatesubnet3aid');

        // *************** DMS Replication Subnet Group *******************

        const DmsReplicationSubnetGroup = new dms.CfnReplicationSubnetGroup(this, 'DmsSubnetGroup', {
            replicationSubnetGroupDescription: 'DMS Replication Instance Subnet Group',
            subnetIds: [subnetIdA, subnetIdB, subnetIdC],
            replicationSubnetGroupIdentifier: `dms-subnets`
        });

        // *************** DMS Secrets ***********************

        const dms_secret = secrets.Secret.fromSecretCompleteArn(this, 'dmsSecrets', this.node.tryGetContext('dms_secret'));

        // ***************** DMS Replication Instance ***********************

        const DmseplicationInstance = new dms.CfnReplicationInstance(this, 'dms-repInstance', {
            replicationInstanceIdentifier: `quickview-cdkv2-dms-replication-instance`,
            replicationInstanceClass: 'dms.t3.medium',
            allocatedStorage: 200,
            autoMinorVersionUpgrade: false,
            allowMajorVersionUpgrade: false,
            engineVersion: '3.4.7',
            kmsKeyId: 'your-kms-key',
            vpcSecurityGroupIds: ['your-security-groupID'],
            replicationSubnetGroupIdentifier: DmsReplicationSubnetGroup.replicationSubnetGroupIdentifier,
            publiclyAccessible: false
        });

        // * Endpoints
        const source_endpoint = new dms.CfnEndpoint(this, 'srcEndpoint', {
            endpointType: 'source',
            engineName: 'postgres',
            databaseName: 'your-db-name',
            endpointIdentifier: 'rds-source-db-endpoint',
            port: 5432,
            serverName: 'your-db-endpoint',
            username: dms_secret.secretValueFromJson('username').unsafeUnwrap(),
            password: dms_secret.secretValueFromJson('password').unsafeUnwrap(),
            postgreSqlSettings: {
                executeTimeout:120
            },
            kmsKeyId: 'your-kms-key',
            sslMode: 'require'
        });

        const target_endpoint = new dms.CfnEndpoint(this, 'trgtEndpoint', {
            endpointType: 'target',
            engineName: 'postgres',
            databaseName: 'your-target-db-name',
            endpointIdentifier: 'rds-target-db-endpoint',
            port: 5432,
            serverName: 'your-target-db-endpoint',
            username: dms_secret.secretValueFromJson('username').unsafeUnwrap(),
            password: dms_secret.secretValueFromJson('password').unsafeUnwrap(),
            postgreSqlSettings: {
                executeTimeout:120
            },
            kmsKeyId: '',
            sslMode: 'require'
        });


        // * Replication Tasks

        const table_mappings = {
            "rules": [
                {
                  "rule-type": "selection",
                  "rule-id": "1",
                  "rule-name": "1",
                  "object-locator": {
                    "schema-name": "dbo",
                    "table-name": "%table_name"
                  },
                  "rule-action": "include"
                }
              ]
            };
            
        const truncate_load_task = new dms.CfnReplicationTask(this, 'truncate&load', {
            migrationType: 'full-load',
            replicationInstanceArn: DmseplicationInstance.ref,
            sourceEndpointArn: source_endpoint.ref,
            targetEndpointArn: target_endpoint.ref,
            resourceIdentifier: `dms-truncate-task`,
            replicationTaskIdentifier: 'dms-truncate-task',
            replicationTaskSettings: JSON.stringify(truncate_settings),
            tableMappings: JSON.stringify(table_mappings),
        }
    )};
};
