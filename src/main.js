import * as core from "@actions/core";

import { createPullRequest } from "./pull-request/service";

export async function main() {
  const targetBranch = core.getInput("to-branch");
  const assignee = core.getInput("assignee");
  const isDraft = core.getBooleanInput("is-draft");

  try {
    const { id, url } = createPullRequest(targetBranch, assignee, isDraft);

    core.setOutput("id", id);
    core.setOutput("url", url);
  } catch (error) {
    core.setFailed(error.message);
  }
}
