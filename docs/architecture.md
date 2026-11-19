# GitLab DevSecOps Architecture

```mermaid
flowchart TD
    DEV[Developer] -->|Push / Merge Request| GL[GitLab Repository]
    GL --> PIPE[GitLab CI Pipeline]
    PIPE --> VAL[Validate<br/>Node syntax + npm audit]
    VAL --> TEST[Unit Tests<br/>Node test runner + JUnit]
    TEST --> SAST[Semgrep SAST]
    TEST --> GIT[Gitleaks secret detection]
    SAST --> BUILD[Docker build]
    GIT --> BUILD
    BUILD --> REG[GitLab Container Registry<br/>Commit-SHA image tag]
    REG --> TRIVY[Trivy image scan<br/>CycloneDX SBOM]
    TRIVY --> APPROVE{Manual deployment approval}
    APPROVE -->|OIDC ID token| STS[AWS STS]
    STS --> ROLE[IAM deployment role<br/>Project + branch trust conditions]
    ROLE --> ECR[Amazon ECR]
    ECR --> ECS[Amazon ECS Fargate service]
    ECS --> CW[Amazon CloudWatch Logs]
```

## Security boundaries

- GitLab CI runners execute repository-controlled build and scan commands.
- GitLab Container Registry stores the immutable commit-SHA image used by the deployment.
- GitLab OIDC tokens are exchanged for short-lived AWS credentials through STS.
- The IAM role is restricted to the GitLab project and protected default branch.
- The deployment is a manual action and requires explicit AWS variables.
- ECS deployment reuses the existing Project 02 service; it does not provision new network or compute infrastructure.
