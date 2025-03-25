# Create a Pull Request

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=alert_status&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=sqale_rating&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=security_rating&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=reliability_rating&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)

Action to create or get an existing Pull Request on a [Github](https://github.com) repository.
Works **ONLY** with [Github Action](https://github.com/features/actions).

## Usage

```yaml
- id: step-id
  uses: nebetoxyz/create-pull-request--action@vx.x.x
  with:
    # A valid Github token.
    github-token: ${{ secrets.GITHUB_TOKEN }}

    # Indicates whether the Pull Request is a draft.
    # Default : true
    is-draft: true

    # The name of the branch you want the changes pulled into.
    # This should be an existing branch on the current repository. You cannot submit a Pull Request to one repository that requests a merge to a base of another repository.
    # Default : main
    to-branch: "main"

    # Usernames of people to assign this Pull Request to.
    assignees: |
      "fgruchala"
```

You will have as outputs :

- `${{ steps.step-id.outputs.id }}` : the unique ID of the Pull Request, given by Github e.g. **1** ;
- `${{ steps.step-id.outputs.url }}` : the URL of the Pull Request, given by Github e.g. **https://github.com/.../pulls/1**

## Samples

### Create a draft Pull Request

```yaml
name: develop

on:
  workflow_dispatch:
  push:
    branches:
      - feat/**
      - fix/**
      - docs/**
      - ci/**
      - chore/**
      - test/**
      - perf/**
      - refactor/**
      - revert/**
      - style/**

permissions:
  contents: read
  pull-requests: write

jobs:
  create-pull-request:
    runs-on: ubuntu-latest
    name: Create a draft Pull Request
    steps:
      - id: checkout-code
        name: Checkout code
        uses: actions/checkout@v4
      - id: create-or-get-existing-pull-request
        name: Create or get an existing Pull Request on Github
        uses: nebetoxyz/create-pull-request--action@v1.13.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Create a Pull Request with explicit assignees

```yaml
name: develop

on:
  workflow_dispatch:
  push:
    branches:
      - feat/**
      - fix/**
      - docs/**
      - ci/**
      - chore/**
      - test/**
      - perf/**
      - refactor/**
      - revert/**
      - style/**

permissions:
  contents: read
  pull-requests: write

jobs:
  create-pull-request:
    runs-on: ubuntu-latest
    name: Create a Pull Request with explicit assignees
    steps:
      - id: checkout-code
        name: Checkout code
        uses: actions/checkout@v4
      - id: create-or-get-existing-pull-request
        name: Create or get an existing Pull Request on Github
        uses: nebetoxyz/create-pull-request--action@v1.13.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          is-draft: false
          assignees: |-
            ${{ github.actor }}
            fgruchala
```

## Contact

For any question or feature suggestion, you can take a look and open, if necessary, a new [discussion](https://github.com/nebetoxyz/create-pull-request--action/discussions).

For any bug, you can take a look to our active issues and open, if necessary, a new [issue](https://github.com/nebetoxyz/create-pull-request--action/issues).

## Troubleshooting

### Workflow Permissions

Your workflow needs to have these two permissions :

```yaml
permissions:
  contents: read
  pull-request: write
```

More informations about [permissions in Github Action](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token).

### Template of a Pull Request

Your project need to have a `.github/PULL_REQUEST_TEMPLATE.md` file, e.g. :

```markdown
# Gentle Reminder

- [ ] I have performed a self-review of my code ;
- [ ] I have updated all dependencies, to keep up to date and secure our product ;
- [ ] I have checked [SonarQube](https://sonarcloud.io/project/overview?id=nebetoxyz_create-pull-request-action) ;
- [ ] **If** it's a core feature, I have added thorough tests ;
- [ ] **If** it's a core feature, I have documentated it in the [README.md](../README.md).
```
