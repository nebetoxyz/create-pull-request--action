const core = require("@actions/core");

import { createPullRequest } from "./pull-request/service";

async function main() {
  const sourceBranch = core.getInput("from-branch");
  const targetBranch = core.getInput("to-branch");
  const assignee = core.getInput("assignee");
  const isDraft = core.getBooleanInput("is-draft");

  try {
    const { id, url } = createPullRequest(
      sourceBranch,
      targetBranch,
      assignee,
      isDraft
    );

    core.setOutput("id", id);
    core.setOutput("url", url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

await main();
