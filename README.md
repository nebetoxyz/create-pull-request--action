# Create a Pull Request

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=alert_status&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=sqale_rating&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=security_rating&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=nebetoxyz_create-pull-request-action&metric=reliability_rating&token=ee9d6a8a5da118704f7c19f7865b50ede069cc5e)](https://sonarcloud.io/summary/new_code?id=nebetoxyz_create-pull-request-action)

Action to create or get an existing Pull Request on a [Github](https://github.com) repository.
Works **ONLY** with [Github Action](https://github.com/features/actions).

## Usage

```yaml
- id: create-or-get-existing-pull-request
  uses: nebetoxyz/create-pull-request--action@v1
  with:
    # Indicates whether the pull request is a draft.
    # Default : true
    is-draft: true

    # The name of the branch you want the changes pulled into.
    # This should be an existing branch on the current repository. You cannot submit a pull request to one repository that requests a merge to a base of another repository.
    # Default : ${{ github.event.repository.default_branch }}
    to-branch: "main"

    # Usernames of people to assign this issue to.
    # Only users with push access can add assignees to an issue. Assignees are silently ignored otherwise.
    # Default : ${{ github.actor }}
    assignees: |-
      "fgruchala"
```

You will have as outputs :

- `${{ steps.create-or-get-existing-pull-request.outputs.id }}` : the unique ID of the Pull Request, given by Github e.g. **1** ;
- `${{ steps.create-or-get-existing-pull-request.outputs.url }}` : the URL of the Pull Request, given by Github e.g. **https://github.com/.../pulls/1**

## Samples

### Create a draft Pull Request

### Create a Pull Request with explicit assignees

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
