# Containerized CI/CD Pipeline — AWS ECS Fargate

**Author:** Pelumi Oke  
**Project:** AWS Portfolio — Project 02  
**Status:** Implemented and deployment verified

## Project Overview

This project demonstrates an end-to-end container delivery workflow for a Node.js/Express application. GitHub Actions installs dependencies, runs automated tests, builds a Docker image, publishes versioned images to Amazon ECR and GitHub Container Registry (GHCR), then deploys the ECR image to Amazon ECS on AWS Fargate.

GitHub Actions authenticates to AWS using OpenID Connect (OIDC) and temporary IAM credentials. No long-lived AWS access keys are stored in GitHub.

## Architecture

```text
Developer pushes to main
          |
          v
     GitHub Actions
          |
    npm ci + tests
          |
     Docker build
          |
    +-----+--------------------+
    |                          |
    v                          v
Authenticate to AWS       Authenticate to GHCR
using GitHub OIDC              |
    |                          v
    v                     Push image
Authenticate to ECR       to GHCR
    |
    v
Push image to ECR
    |
    v
Render ECS task definition
with commit-SHA image
    |
    v
Register task definition
and update ECS service
    |
    v
Amazon ECS / AWS Fargate
(public subnets, public IP,
container port 3000)
    |
    v
CloudWatch Logs
```

The ECS service runs in public subnets in the existing Project 01 VPC. The Fargate task receives a public IP so it can pull its image from ECR and serve the demo application without a NAT Gateway. This is a cost-conscious portfolio demonstration, not a production reference architecture.

## Technology Stack

- **Application:** Node.js 22 and Express
- **Containerization:** Docker
- **Testing:** Node.js test runner and Supertest
- **CI/CD:** GitHub Actions
- **Registries:** Amazon ECR and GitHub Container Registry
- **AWS identity:** GitHub OIDC and IAM role assumption
- **Compute:** Amazon ECS with AWS Fargate
- **Networking:** Amazon VPC, public subnets, security group, public task IP
- **Logging:** Amazon CloudWatch Logs
- **AWS Region:** `us-east-1`

## Application and Tests

The Express application listens on port `3000`. Three automated tests verify that:
1. The home route responds successfully.
2. The page contains the expected project heading.
3. The page identifies the author.

## Run Locally

### Prerequisites

Install Node.js, npm, and Docker.

### Run with Node.js

```bash
npm ci
npm test
npm start
```

Open http://localhost:3000.

### Build and run with Docker

```bash
docker build -t pelumi-containerized-cicd .
docker run --rm -p 3000:3000 pelumi-containerized-cicd
```

Open http://localhost:3000. If host port 3000 is occupied, map another host port, for example `-p 3001:3000`.

## CI/CD Workflow

Workflow file: `.github/workflows/ci.yml`

For pull requests targeting `main`, the workflow checks out the repository, installs dependencies, runs tests, and builds the Docker image. It does not publish or deploy.

For pushes to `main`, the workflow additionally:
1. Authenticates to GHCR.
2. Assumes `GitHubActions-PelumiContainerizedCICD` through GitHub OIDC.
3. Authenticates to Amazon ECR.
4. Publishes the image to ECR and GHCR with `latest` and full commit-SHA tags.
5. Renders `ecs-task-definition.json` with the commit-SHA ECR image.
6. Registers the new ECS task-definition revision.
7. Updates `pelumi-project02-service` in `pelumi-project02-cluster` and waits for service stability.

The task definition template uses the placeholder `REPLACED_BY_GITHUB_ACTIONS`; the render action replaces it with the image built for that commit.

## AWS Deployment Configuration

| Component | Configuration |
|---|---|
| Region | `us-east-1` |
| ECS cluster | `pelumi-project02-cluster` |
| ECS service | `pelumi-project02-service` |
| Task family | `pelumi-project02-task` |
| Runtime | AWS Fargate |
| Task size | 0.25 vCPU, 512 MiB memory |
| Container | `pelumi-app` |
| Container port | TCP 3000 |
| Image repository | `pelumi-containerized-cicd` in Amazon ECR |
| Logs | `/ecs/pelumi-project02` (7-day retention) |
| Networking | Public subnets in the Project 01 VPC; public IP assigned to task |

The service uses the existing public subnets `10.0.1.0/24` and `10.0.2.0/24`. No NAT Gateway or Application Load Balancer is provisioned for this demonstration. The task's public IP can change when ECS replaces the task, so it is not a stable application URL.

### IAM and security

- GitHub Actions assumes the IAM role `GitHubActions-PelumiContainerizedCICD` using OIDC.
- The GitHub role has permissions to publish to this ECR repository, register task definitions, describe the service/task definition, update the ECS service, and pass the ECS task execution role to ECS.
- The task execution role is `PelumiProject02ECSTaskExecutionRole`; it allows ECS to pull the private ECR image and write container logs.
- The GitHub repository variable `AWS_ROLE_ARN` contains the role ARN. No permanent AWS access keys are required.

**Security limitation:** the demo security group currently permits inbound TCP 3000 from `0.0.0.0/0` so the application can be tested directly. This broad rule is temporary and must be restricted or removed when the public demo is not in use. A production design should normally place tasks behind an Application Load Balancer, use HTTPS, and keep application tasks private.

## Verification

The GitHub Actions run on 3 November 2026 completed successfully:

[Open successful deployment run #41638589404](https://github.com/fhyxx/pelumi-containerized-cicd/actions/runs/41638589404)

The deployment was independently verified from the AWS CLI:
- ECS service status: `ACTIVE`.
- Primary deployment rollout state: `COMPLETED`.
- Desired tasks: 1; running tasks: 1; pending tasks: 0.
- Service event: `has reached a steady state`.
- Deployed task definition: `pelumi-project02-task:2`.
- Running container: `pelumi-app`.
- Direct HTTP request to the task public IP on port 3000 returned **HTTP 200** and the expected Project 02 HTML response.

The ECS task/container health field was reported as `UNKNOWN` because no container health check is defined in the task definition. The successful HTTP response and ECS steady state are the current application-level verification evidence; they should not be represented as an ECS container health-check result.

## Published Container Images

### Amazon ECR

Private repository: `008151431773.dkr.ecr.us-east-1.amazonaws.com/pelumi-containerized-cicd`

Images are tagged with `latest` and the full Git commit SHA. ECR authentication and pull permissions are required.

### GitHub Container Registry

`ghcr.io/fhyxx/pelumi-containerized-cicd:latest`

The workflow also publishes the full commit-SHA tag to GHCR.

## Cost Management

Fargate tasks incur charges while running, and ECR storage, CloudWatch Logs, and data transfer may also incur charges. This demo is configured with one small Fargate task and no NAT Gateway or load balancer.

When the public demo is not needed, set the ECS service desired count to zero to stop task compute charges. To deploy and serve the app again, restore desired count to one. Note that the current GitHub deployment workflow updates the task definition but does not automatically scale a service from zero to one.

Review AWS Billing and Cost Management after testing.

## Evidence

See the [implementation evidence gallery](evidence/README.md) for the CI workflow, automated tests, registry images, OIDC configuration, and deployment verification screenshots to capture.

## Repository

[Source code on GitHub](https://github.com/fhyxx/pelumi-containerized-cicd)

## Author

**Pelumi Oke**  
Cloud Engineering | AWS Solutions Architecture | DevOps and Automation
