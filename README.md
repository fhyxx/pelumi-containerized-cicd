# Containerized CI/CD Pipeline — AWS & GitHub Actions

**Author:** Pelumi Oke  
**Project:** AWS Portfolio — Project 02  
**Status:** Implemented and verified

## Project Overview

I built a containerized Node.js application and configured GitHub Actions to test it, build a Docker image, and publish versioned images to GitHub Container Registry (GHCR) and Amazon Elastic Container Registry (Amazon ECR).

I configured GitHub OpenID Connect (OIDC) so the workflow could assume an AWS IAM role and receive temporary credentials, avoiding long-lived AWS access keys in GitHub.

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

The workflow was configured to run tests and build the Docker image for pull requests targeting `main`. It published images only after pushes to `main`.

## Technology Stack

- **Application:** Node.js and Express
- **Containerization:** Docker
- **Automated testing:** Node.js test runner and Supertest
- **CI/CD:** GitHub Actions
- **Container registries:** Amazon ECR and GitHub Container Registry
- **AWS authentication:** IAM OIDC identity provider and IAM role
- **AWS Region:** `us-east-1`

## What I Implemented

- Configured automated dependency installation and testing.
- Added Docker image building to the CI workflow.
- Configured publishing to Amazon ECR and GHCR.
- Published images with `latest` and full commit-SHA tags for traceability.
- Configured AWS authentication through temporary OIDC credentials.
- Scoped the IAM permissions to the Project 02 ECR repository, with the required account-level authorization-token permission.
- Avoided storing permanent AWS access keys in GitHub.
- Restricted publishing steps to pushes to `main`.

## Application and Tests

The Express application serves a simple web page on port `3000`.

I added three automated tests to verify that:
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

## Published Container Images

### GitHub Container Registry

The workflow published the image to:

`ghcr.io/fhyxx/pelumi-containerized-cicd:latest`

Pull and run it:

```bash
docker pull ghcr.io/fhyxx/pelumi-containerized-cicd:latest
docker run --rm -p 3001:3000 ghcr.io/fhyxx/pelumi-containerized-cicd:latest
```

Open http://localhost:3001.

### Amazon ECR

I created the private ECR repository `pelumi-containerized-cicd` in `us-east-1`. The workflow published these tags:

- `latest`
- The full Git commit SHA

The image URI follows this format:

`AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/pelumi-containerized-cicd:latest`

Replace `AWS_ACCOUNT_ID` with your AWS account's 12-digit account ID when constructing the actual URI.

Amazon ECR is private by default. Pulling from it requires AWS authentication and permission to download the image.

## CI/CD Workflow

Workflow file: `.github/workflows/ci.yml`

I configured the workflow to:

1. Check out the repository.
2. Set up Node.js.
3. Install dependencies with `npm ci`.
4. Run the automated tests.
5. Build the Docker image.
6. Authenticate to GHCR.
7. Assume the configured AWS IAM role using GitHub OIDC.
8. Authenticate to Amazon ECR.
9. Push the image to both registries using `latest` and commit-SHA tags.

On pull requests targeting `main`, the workflow runs tests and builds the image without publishing it. On pushes to `main`, it also publishes the images.

## AWS Security Design

I configured GitHub Actions to assume the IAM role `GitHubActions-PelumiContainerizedCICD` through the GitHub OIDC identity provider.

The role's trust policy restricts access to the intended repository and `main` branch subject. The attached IAM policy grants the ECR permissions needed to publish images to this project's repository.

I stored the role ARN in the GitHub repository variable `AWS_ROLE_ARN`. The workflow does not require permanent AWS access keys.

## Cost Considerations

The project uses Amazon ECR for container image storage. Storage and data transfer charges may apply depending on usage and applicable AWS allowances.

I did not include an ECS cluster, Fargate service, NAT Gateway, or continuously running EC2 instance in this project. Those deployment components remain outside the current scope, keeping the implementation focused on testing, containerization, and registry publishing.

Review AWS Billing and Cost Management periodically.

## Evidence

I uploaded implementation screenshots to the [evidence gallery](evidence/README.md), including the successful workflow, automated tests, ECR image tags, OIDC role, local container, and GHCR package.

## Verification

The [successful GitHub Actions run](https://github.com/fhyxx/pelumi-containerized-cicd/actions/runs/39781843020) completed the automated tests, Docker image build, AWS OIDC authentication, ECR authentication, and image publishing to both container registries.

The ECR repository screenshot also showed the published image tags.

## Repository

[Source code on GitHub](https://github.com/fhyxx/pelumi-containerized-cicd)

## Author

**Pelumi Oke**  
Cloud Engineering | AWS Solutions Architecture | DevOps and Automation
