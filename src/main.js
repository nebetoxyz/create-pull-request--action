import * as core from "@actions/core";

import { getContext } from "./context/service";
import { createPullRequest } from "./pull-request/service";

export async function main() {
  const token = core.getInput("github-token");
  const targetBranch = core.getInput("to-branch");
  const assignees = core.getInput("assignees").split(/[\r\n]/);
  const isDraft = core.getBooleanInput("is-draft");

  try {
    const context = getContext(token);
    const { id, url } = await createPullRequest(
      context,
      targetBranch,
      assignees,
      isDraft
    );

    core.setOutput("id", id);
    core.setOutput("url", url);
  } catch (error) {
    core.setFailed(error.message);
  }
}
