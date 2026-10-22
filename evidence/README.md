# Project 02 Evidence Checklist

This folder is reserved for genuine screenshots that document the Containerized CI/CD Pipeline. Do not add fabricated or recreated screenshots; capture the actual GitHub, AWS Console, and local application views.

## Verified online evidence

- [Successful GitHub Actions run](https://github.com/fhyxx/pelumi-containerized-cicd/actions/runs/39781843020)
- [Repository](https://github.com/fhyxx/pelumi-containerized-cicd)
- [Project README](../README.md)

## Screenshots to capture

Save the screenshots in this folder using these filenames:

1. `01-github-actions-success.png` — GitHub Actions run showing the successful workflow and completed publish steps.
2. `02-automated-tests.png` — test output showing all three automated tests passing. The Actions job summary or terminal output is suitable.
3. `03-ecr-image-tags.png` — Amazon ECR repository `pelumi-containerized-cicd` in `us-east-1`, showing the `latest` and commit-SHA image tags.
4. `04-github-oidc-role.png` — IAM role trust relationship for GitHub OIDC. Keep the relevant provider and repository/branch restriction visible; do not include access keys, secrets, or other credentials.
5. `05-local-container-running.png` — browser showing the app running locally in a Docker container, such as `http://localhost:3001`.
6. `06-ghcr-package.png` *(optional)* — the published GitHub Container Registry package and its tags.

## Evidence notes

- Crop screenshots to the relevant console or browser area and keep text readable.
- Never include passwords, tokens, access keys, session credentials, or private repository secrets.
- Do not launch ECS, Fargate, NAT Gateway, or other paid infrastructure just to obtain screenshots. The current evidence can be captured without deploying a long-running AWS workload.
- Once screenshots are added, link each one here with a short caption describing what it proves.
