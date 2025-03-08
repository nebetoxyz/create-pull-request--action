import { expect, jest } from "@jest/globals";

import * as fs from "./fixtures/fs.fixture.js";
import * as github from "./fixtures/github.github.fixture.js";

jest.unstable_mockModule("@actions/github", () => github);
jest.unstable_mockModule("fs", () => fs);

const {
  createPullRequest,
  getAllPullRequests,
  addAssigneesByPullRequestId,
  addLabelsByPullRequestId,
} = await import("../src/pull-request/service.js");

describe("Default", () => {
  beforeEach(() => {
    github.context.repo.owner = "nebetoxyz";
    github.context.repo.repo = "create-pull-request--action";
    github.context.ref = "refs/heads/feat/1-test";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Should list existing Pull Requests", async () => {
    github.rest.pulls.list.mockImplementation(() => []);
    github.paginate.mockImplementation(() => [
      {
        number: 1,
        html_url:
          "https://github.com/nebetoxyz/create-pull-request--action/pulls/1",
        head: {
          ref: "feat/1-test",
        },
      },
    ]);

    const pullRequests = await getAllPullRequests();

    expect(github.paginate).toHaveBeenCalledTimes(1);
    expect(github.paginate).toHaveBeenCalledWith(github.rest.pulls.list, {
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
    });

    expect(pullRequests).toStrictEqual([
      {
        id: 1,
        url: "https://github.com/nebetoxyz/create-pull-request--action/pulls/1",
        source: {
          branch: "feat/1-test",
        },
      },
    ]);
  });

  it("Should add assignees to a Pull Request", async () => {
    github.rest.issues.addAssignees.mockImplementation(() => []);

    await addAssigneesByPullRequestId(1, ["fgruchala"]);

    expect(github.rest.issues.addAssignees).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      assignees: ["fgruchala"],
    });
  });

  it("Should add labels to a Pull Request", async () => {
    github.rest.issues.addLabels.mockImplementation(() => []);

    await addLabelsByPullRequestId(1, ["bug"]);

    expect(github.rest.issues.addLabels).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      labels: ["bug"],
    });
  });
});
