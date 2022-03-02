"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const IDENTITY_PROVIDER_ARN = 'arn:aws:iam::927485958639:oidc-provider/token.actions.githubusercontent.com';

let deployRole = new aws.iam.Role('deploy-role', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Sid: 'RoleForGithub',
      Action: 'sts:AssumeRoleWithWebIdentity',
      Effect: 'Allow',
      Principal: {Federated: IDENTITY_PROVIDER_ARN},
      Condition: {StringLike: {'token.actions.githubusercontent.com:sub': `repo:georgi-io/test-frontend:*`}}
    }]
  })
});

let deployRolePolicy = new aws.iam.RolePolicy('deploy-role-policy', {
  role: deployRole.id,
  policy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Action: [
        'ecr:BatchGetImage',
        'ecr:BatchCheckLayerAvailability',
        'ecr:CompleteLayerUpload',
        'ecr:GetDownloadUrlForLayer',
        'ecr:InitiateLayerUpload',
        'ecr:PutImage',
        'ecr:UploadLayerPart',
        'ecr:GetAuthorizationToken'
      ],
      Effect: 'Allow',
      Resource: '*'
    }]
  })
});

// Needs to be put into GitHub-Action
exports.deployRoleARN = deployRole.arn;
