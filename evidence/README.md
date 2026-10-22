# Project 02 — Implementation Evidence

This folder contains screenshots captured during implementation of the **Containerized CI/CD Pipeline**. The GitHub Actions workflow was configured to run automated tests, build a Docker image, and publish image tags to GitHub Container Registry (GHCR) and Amazon Elastic Container Registry (ECR). GitHub OIDC was configured for AWS authentication without storing long-lived AWS access keys.

[Back to the project README](../README.md) · [View the successful workflow run](https://github.com/fhyxx/pelumi-containerized-cicd/actions/runs/39781843020)

## 01 — Successful GitHub Actions workflow

![Screenshot of the successful GitHub Actions workflow](01-github-actions-success.png)

*This screenshot documented the successful completion of the CI/CD workflow.* [View image](01-github-actions-success.png) · [Open the verified run](https://github.com/fhyxx/pelumi-containerized-cicd/actions/runs/39781843020)

## 02 — Automated tests

![Screenshot of automated test results](02-automated-tests.png)

*This screenshot documented the automated test stage. The project included three automated tests.* [View image](02-automated-tests.png)

## 03 — Amazon ECR image tags

![Screenshot of the Amazon ECR repository and image tags](03-ecr-image-tags.png)

*This screenshot showed the Amazon ECR private repository `pelumi-containerized-cicd` in `us-east-1`, including the `latest` and commit-SHA image tags. The screenshot was visually reviewed.* [View image](03-ecr-image-tags.png)

## 04 — GitHub OIDC IAM role

![Screenshot of the GitHub OIDC IAM role trust relationship](04-github-oidc-role.png)

*This screenshot was intended to document the AWS IAM role used for GitHub Actions OIDC authentication and its repository/branch trust restriction.* [View image](04-github-oidc-role.png)

## 05 — Local Docker container

![Screenshot of the application running locally in Docker](05-local-container-running.png)

*This screenshot was intended to document the containerized application running locally, served on host port 3001.* [View image](05-local-container-running.png)

## 06 — GitHub Container Registry package

![Screenshot of the published GHCR package](06-ghcr-package.png)

*This screenshot provided additional evidence of the container image published to GitHub Container Registry.* [View image](06-ghcr-package.png)

## Verification and security notes

- All six screenshot files were uploaded to this folder. The ECR screenshot was visually reviewed; the other images were linked as uploaded but were not independently visually inspected here.
- The [successful workflow run](https://github.com/fhyxx/pelumi-containerized-cicd/actions/runs/39781843020) was independently checked through GitHub workflow metadata.
- Screenshots should not expose passwords, tokens, access keys, session credentials, or repository secrets.
- This project demonstrated testing, containerization, and registry publishing. It did **not** include an ECS/Fargate deployment. No NAT Gateway or long-running paid AWS workload was required for the documented workflow.
