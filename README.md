# Containerized CI/CD Pipeline — AWS & GitHub Actions

**Author:** Pelumi Oke  
**Project:** AWS Portfolio — Project 02  
**Status:** CI/CD pipeline successfully tested

## Overview

This project demonstrates how to package a Node.js application into a Docker container, automatically test it with GitHub Actions, and publish container images to GitHub Container Registry (GHCR) and Amazon Elastic Container Registry (Amazon ECR).

The pipeline uses GitHub Actions OpenID Connect (OIDC) to obtain temporary AWS credentials, avoiding long-lived AWS access keys stored in GitHub.

## Architecture

```text
Developer pushes code to GitHub
              |
              v
       GitHub Actions
              |
              v
       Install dependencies
              |
              v
       Run automated tests
              |
              v
       Build Docker image
              |
              v
     Is this a push to main?
         /           \
       No             Yes
       |               |
   Stop after      Authenticate to
   test/build       AWS using OIDC
                       |
                 +-----+------+
                 |            |
                 v            v
              Amazon ECR    GitHub Container
                             Registry (GHCR)
```

Pull requests targeting `main` run the tests and Docker build. Publishing occurs only after a push to `main`.

## Technology Stack

- **Application:** Node.js and Express
- **Containerization:** Docker
- **Automated testing:** Node.js test runner and Supertest
- **CI/CD:** GitHub Actions
- **Container registries:** Amazon ECR and GitHub Container Registry
- **AWS authentication:** IAM OIDC identity provider and IAM role
- **AWS Region:** `us-east-1`

## Features

- Automated dependency installation and testing
- Docker image build as part of the CI pipeline
- Publication to Amazon ECR and GHCR
- `latest` and commit-SHA image tags for traceability
- AWS authentication through temporary OIDC credentials
- IAM permissions scoped to the Project 02 ECR repository
- No permanent AWS access keys stored in GitHub
- Pull requests do not publish images

## Application

The Express application serves a simple web page on port `3000`.

Automated tests verify that:
1. The home route responds successfully.
2. The page contains the expected project heading.
3. The page identifies the author.

## Run Locally

### Prerequisites

Install Node.js, npm, and Docker.

### Run the application with Node.js

```bash
npm ci
npm test
npm start
```

Open http://localhost:3000 in your browser.

### Build and run with Docker

```bash
docker build -t pelumi-containerized-cicd .
docker run --rm -p 3000:3000 pelumi-containerized-cicd
```

Open http://localhost:3000.

If port `3000` is already occupied, use a different host port, such as `3001`:

```bash
docker run --rm -p 3001:3000 pelumi-containerized-cicd
```

Then open http://localhost:3001.

## Container Images

### GitHub Container Registry

The published GHCR image is:

`ghcr.io/fhyxx/pelumi-containerized-cicd:latest`

Pull and run it:

```bash
docker pull ghcr.io/fhyxx/pelumi-containerized-cicd:latest
docker run --rm -p 3001:3000 ghcr.io/fhyxx/pelumi-containerized-cicd:latest
```

Open http://localhost:3001.

### Amazon ECR

The private ECR repository is named `pelumi-containerized-cicd` in `us-east-1`.

The workflow publishes two tags:
- `latest`
- The full Git commit SHA

The image URI follows this format:

`AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/pelumi-containerized-cicd:latest`

Replace `AWS_ACCOUNT_ID` with your AWS account's 12-digit account ID when constructing the actual URI.

Amazon ECR is private by default. Pulling from it requires AWS authentication and permission to download the image.

## CI/CD Workflow

Workflow file: `.github/workflows/ci.yml`

On pushes to `main`, the workflow:
1. Checks out the repository.
2. Sets up Node.js.
3. Installs dependencies with `npm ci`.
4. Runs the automated tests.
5. Builds the Docker image.
6. Authenticates to GHCR.
7. Assumes the configured AWS IAM role using GitHub OIDC.
8. Authenticates to Amazon ECR.
9. Pushes the image to both registries using `latest` and commit-SHA tags.

On pull requests targeting `main`, the workflow runs the tests and builds the image without publishing it.

## AWS Security Design

GitHub Actions assumes the IAM role `GitHubActions-PelumiContainerizedCICD` through the configured OIDC identity provider.

The role's trust policy restricts assumption to the intended repository and `main` branch subject. The attached IAM policy grants the ECR permissions required by this project.

The workflow uses the repository variable `AWS_ROLE_ARN` to reference the role. No permanent AWS access keys are required.

## Cost Considerations

This project uses Amazon ECR for container image storage. Storage and data transfer charges may apply depending on usage and applicable AWS allowances.

This project does not require an ECS cluster, Fargate service, NAT Gateway, or continuously running EC2 instance. Those deployment components are outside the current project scope.

Review AWS Billing and Cost Management periodically.

## Verification

The GitHub Actions workflow completed successfully, including automated tests, Docker image build, AWS OIDC authentication, ECR authentication, and publishing to both container registries.

[View the successful GitHub Actions run](https://github.com/fhyxx/pelumi-containerized-cicd/actions/runs/39781843020)

## Repository

[Source code on GitHub](https://github.com/fhyxx/pelumi-containerized-cicd)

## Author

**Pelumi Oke**  
Cloud Engineering | AWS Solutions Architecture | DevOps and Automation
