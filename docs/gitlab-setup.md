# GitLab Project Setup

This repository extends Project 02 with a GitLab CI/CD implementation. The existing GitHub Actions workflow remains intact; the GitLab pipeline is defined in `.gitlab-ci.yml`.

## 1. Create the GitLab project

1. Sign in to GitLab.
2. Create a blank project named `pelumi-containerized-cicd` under your personal namespace.
3. Keep the project private initially if you do not want the application source mirrored publicly.
4. Import the GitHub repository or push this branch to GitLab.
5. Set the GitLab default branch to `main` after the initial import.

Suggested branch to import from GitHub: `feat/gitlab-devsecops`.


## 1A. Push the prepared branch from Windows PowerShell

Create the GitLab project as a **blank project**. Do not initialize it with a README, license, or `.gitignore`; this avoids unrelated initial-commit conflicts.

Then run:

```powershell
git clone https://github.com/fhyxx/pelumi-containerized-cicd.git
Set-Location pelumi-containerized-cicd
git fetch origin
git checkout feat/gitlab-devsecops
git remote add gitlab https://gitlab.com/<YOUR_GITLAB_NAMESPACE>/pelumi-containerized-cicd.git
git push -u gitlab HEAD:main
```

Replace `<YOUR_GITLAB_NAMESPACE>` with your GitLab username or group path. The GitLab project will receive the prepared branch as its `main` branch. The original GitHub `main` branch remains unchanged.

After the push, open **Build > Pipelines** in GitLab. The first pipeline should run validation, tests, build, and security jobs. The AWS deployment job remains hidden until `AWS_DEPLOY_ROLE_ARN` is configured.

## 2. Enable a runner

The pipeline uses Docker-in-Docker for building and publishing the application image. Use a GitLab-hosted runner that supports Docker-in-Docker or a properly configured self-managed runner with privileged Docker service support.

The build and deploy jobs use Docker-in-Docker with TLS enabled. Do not disable TLS as a shortcut. If using a self-managed runner, follow GitLab's official runner security guidance before enabling privileged mode.

## 3. Pipeline stages

| Stage | Job | Purpose |
|---|---|---|
| Validate | `validate` | Node syntax checks, production dependency audit |
| Test | `unit_tests` | Install dependencies, execute Node tests, and publish JUnit results |
| Security | `semgrep_sast` | Static analysis with Semgrep's Node.js rules |
| Security | `secret_detection` | Detect committed secrets with Gitleaks |
| Package | `build_and_publish` | Build and push immutable commit-SHA and latest images to GitLab Container Registry |
| Security | `container_scan` | Scan the published image with Trivy and retain a CycloneDX SBOM |
| Deploy | `deploy_to_aws` | Manually approve AWS ECS deployment using GitLab OIDC |

The AWS deployment job is intentionally manual and only appears on the default branch when the deployment role variable is configured.

## 4. GitLab CI/CD variables for AWS deployment

Configure these as project or group CI/CD variables. Mark sensitive values as protected where applicable. No static AWS access key or secret key is required.

| Variable | Example / purpose |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | IAM role ARN trusted for this GitLab project's OIDC token |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `pelumi-containerized-cicd` |
| `ECS_CLUSTER` | `pelumi-project02-cluster` |
| `ECS_SERVICE` | `pelumi-project02-service` |
| `ECS_TASK_FAMILY` | `pelumi-project02-task` |
| `ECS_CONTAINER_NAME` | `pelumi-app` |
| `ECS_DESIRED_COUNT` | `1` for a live smoke test; set to `0` to keep the service stopped |

Do not define `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY`. Authentication uses the short-lived GitLab OIDC token and AWS STS.

## 5. Branch protection and deployment controls

- Protect the default branch.
- Require successful pipeline checks before merging.
- Restrict who can merge to the default branch.
- Protect the production environment and restrict deployment approvals.
- Keep the AWS deploy role variable protected so untrusted branches cannot access it.
- Review pipeline logs before approving a production deployment.

## 6. Important implementation notes

- The container scan fails the pipeline for HIGH or CRITICAL findings. Review findings and remediate dependencies or base-image packages; do not suppress findings merely to make the pipeline green.
- Semgrep uses its community Node.js ruleset. It is not a claim of GitLab Ultimate's native SAST feature.
- Gitleaks scans the checked-out working tree. Enable GitLab's native secret detection as an additional control if the project's GitLab tier supports it.
- The pipeline publishes images to GitLab Container Registry and then copies the exact commit-SHA image into Amazon ECR for ECS deployment.
- The deployment job reuses the current ECS task definition and changes only the selected container image.
- The job waits for ECS service stability. This is deployment verification, not a substitute for application-level smoke tests or a load balancer health check.

## 7. First-run validation

Run the pipeline without AWS variables first. Validate stages through container scanning. Then configure the OIDC role and AWS variables, run the default-branch pipeline, and inspect the manual deployment job before approving it.

No AWS resources are created by importing the repository or running the non-deployment pipeline stages.


### AWS cost warning

The existing Project 02 ECS service was previously scaled to zero tasks. Setting `ECS_DESIRED_COUNT=1` starts a Fargate task and can incur compute, networking, logging, and image-storage charges. Only approve the manual deployment when you are ready to run the task. After the smoke test, set the service desired count back to `0` and verify that no tasks remain running. A desired count of `0` updates the task definition but does not validate a running application.
