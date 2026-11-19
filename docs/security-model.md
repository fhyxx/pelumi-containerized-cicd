# DevSecOps Security Model

## Scope

This project demonstrates security checks in a CI/CD workflow for a small Node.js application and a container image deployed to an existing Amazon ECS service. It is a portfolio lab, not a certified compliance implementation.

## Controls implemented in the pipeline

| Control | Tool / mechanism | Pipeline behavior |
|---|---|---|
| Source syntax validation | Node.js `--check` | Fails on syntax errors |
| Production dependency audit | `npm audit --omit=dev` | Fails on HIGH or CRITICAL advisories |
| Unit tests | Node.js test runner + Supertest | Fails on test failures |
| Static analysis | Semgrep Node.js rules | Fails on findings returned as errors |
| Secret detection | Gitleaks | Fails when secrets are detected in checked-out files |
| Container vulnerability scan | Trivy | Fails on HIGH or CRITICAL image findings |
| Registry access | GitLab CI job token | No hard-coded registry password |
| AWS authentication | GitLab OIDC + AWS STS | Short-lived credentials; no static AWS keys |
| Deployment approval | Manual GitLab job | Human approval before ECS update |

## Trust boundaries

1. **Source control:** Developers submit changes through branches and merge requests.
2. **CI runner:** Executes repository code and build tooling. Treat runners as sensitive infrastructure; use isolated runners and protect deployment jobs.
3. **GitLab Container Registry:** Stores images tagged by immutable commit SHA. The `latest` tag is convenient but must not be used as a deployment identity.
4. **AWS STS:** Validates the GitLab OIDC token and issues short-lived role credentials.
5. **Amazon ECR:** Stores the exact image selected for ECS deployment.
6. **Amazon ECS:** Runs the application using its task execution role and task role.

## Threats and mitigations

| Threat | Mitigation | Remaining consideration |
|---|---|---|
| Vulnerable npm dependency | Production dependency audit | Audit database and package reachability need review |
| Source-code weakness | Semgrep rules | Community rules are not exhaustive |
| Accidental secret commit | Gitleaks | Historical Git history scanning is not enabled by this job |
| Vulnerable container package | Trivy image scan | Findings require triage; scanner database freshness matters |
| Credential leakage | OIDC and STS temporary credentials | Runner isolation and token handling remain critical |
| Unauthorized deployment | Protected branch, protected variable, manual job | GitLab project permissions and environment protections must be configured |
| Mutable image tag | Commit-SHA image tag used for deployment | Registry retention and digest pinning can further improve provenance |
| Compromised CI runner | Use trusted, isolated runners | Docker-in-Docker requires careful runner security configuration |

## Explicit limitations

- This pipeline does not establish FedRAMP, FIPS 140, NIST 800-53, or any other compliance authorization.
- It does not implement GitLab Ultimate's complete native security dashboard or all its licensed scanners.
- It does not generate signed provenance or enforce image signature verification at ECS admission/runtime.
- It does not perform dynamic application security testing (DAST).
- It does not create a private networking architecture, load balancer, WAF, or production-grade ingress.
- It does not replace human review, threat modeling, penetration testing, or operational monitoring.

## Improvement backlog

1. Add GitLab-native SAST, dependency scanning, secret detection, and container scanning where the subscription tier supports them.
2. Generate and retain a CycloneDX SBOM using Trivy.
3. Add image signing and verification (for example, Cosign).
4. Add a deployment smoke test and explicit rollback job.
5. Add protected environments and approval rules.
6. Pin CI images and third-party CI components by immutable digest/commit.
7. Consider a non-privileged BuildKit rootless build strategy for self-managed runners.
