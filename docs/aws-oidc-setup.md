# AWS OIDC Deployment Setup for GitLab CI

This guide configures short-lived AWS credentials for the GitLab deployment job. It deliberately avoids long-lived IAM user access keys.

## Before you start

You need permission in the AWS account to manage IAM identity providers, roles, and policies. The deployment job targets the existing Project 02 resources in `us-east-1`.

Do not run the deployment job until the GitLab project path, branch protection, AWS trust policy, and permissions have been reviewed.

## 1. Obtain the GitLab OIDC issuer

For GitLab.com, the OIDC issuer is:

`https://gitlab.com`

Create an IAM OpenID Connect identity provider with:
- Provider URL: `https://gitlab.com`
- Audience: `sts.amazonaws.com`

If the provider already exists in the AWS account, reuse it after verifying its URL and audience. Do not create duplicates.

## 2. Restrict the role trust policy

Replace the namespace, project path, and default branch placeholders with the exact GitLab values. The `sub` condition must be as narrow as possible and should match only the protected default branch.

Example trust policy (replace placeholders before use):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/gitlab.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "gitlab.com:aud": "sts.amazonaws.com",
          "gitlab.com:sub": "project_path:<GITLAB_NAMESPACE>/pelumi-containerized-cicd:ref_type:branch:ref:main",
          "gitlab.com:namespace_id": "<GITLAB_NAMESPACE_ID>",
          "gitlab.com:project_id": "<GITLAB_PROJECT_ID>"
        }
      }
    }
  ]
}
```

Replace both stable numeric ID placeholders with the actual GitLab namespace and project IDs. GitLab.com supports these additional AWS condition keys; they protect the trust relationship against project or namespace renames. The exact subject format depends on GitLab's token claims and project configuration. Inspect a safely decoded, non-secret token claim set or GitLab's documentation before applying the condition. Never paste a live OIDC token into tickets, chat, logs, or a public repository.

## 3. Attach least-privilege permissions

The role needs only the actions required by this pipeline and the existing ECS service. Scope ECR actions to the single repository and ECS actions to the specific cluster/service/task family wherever AWS supports resource-level restrictions.

Typical permission groups include:

- ECR authentication: `ecr:GetAuthorizationToken` (resource `*`).
- ECR repository operations: `ecr:BatchCheckLayerAvailability`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`, `ecr:PutImage`, and any required layer/image read actions, scoped to the target repository.
- ECS read/update: `ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`, `ecs:DescribeServices`, `ecs:UpdateService`, scoped as tightly as supported.
- IAM pass role: `iam:PassRole` for only the task execution role and task role referenced by the ECS task definition. Add an `iam:PassedToService = ecs-tasks.amazonaws.com` condition.

Do not attach AdministratorAccess. Confirm the task definition's execution and task role ARNs before authorizing PassRole.

## 4. Configure GitLab variables

Set the variables documented in [gitlab-setup.md](gitlab-setup.md), including `AWS_DEPLOY_ROLE_ARN`. Mark the role ARN variable as protected and ensure the default branch is protected.

## 5. Validate identity before deployment

The pipeline runs:

```sh
aws sts get-caller-identity
```

Confirm the returned account and assumed-role identity are the expected AWS account and deployment role. If the identity is wrong, stop the pipeline and correct the trust/variable configuration.

## 6. Deployment behavior

The manual job:
1. Pulls the commit-SHA image from GitLab Container Registry.
2. Pushes the same image to the target Amazon ECR repository.
3. Reads the current ECS task definition.
4. Changes only the configured container image.
5. Registers a new task-definition revision.
6. Updates the ECS service.
7. Waits for the ECS service to reach a stable state.

The service must already exist. This pipeline does not create the VPC, ECS cluster, ECS service, IAM roles, or ECR repository.

## 7. Operational safeguards

- Keep deployment manual until the process has been reviewed and tested.
- Restrict production deployment permissions.
- Use protected branches and protected variables.
- Review Trivy findings before deployment.
- Keep rollback instructions available: redeploy a previously known-good task-definition revision.
- Monitor ECS service events and CloudWatch logs after deployment.
- Avoid running deployments against production without explicit approval and a maintenance/rollback plan.

## References

- GitLab OIDC with AWS: https://docs.gitlab.com/ci/cloud_services/aws/
- GitLab ID tokens: https://docs.gitlab.com/ci/secrets/id_token_authentication/
- AWS IAM OIDC federation: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
- Amazon ECS task definition registration: https://docs.aws.amazon.com/cli/latest/reference/ecs/register-task-definition.html
