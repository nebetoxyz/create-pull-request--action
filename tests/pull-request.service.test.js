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
  addCommentByPullRequestId,
} = await import("../src/pull-request/service.js");

describe("Default", () => {
  beforeEach(() => {
    github.context.repo.owner = "nebetoxyz";
    github.context.repo.repo = "create-pull-request--action";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Should list existing Pull Requests", async () => {
    github.context.ref = "refs/heads/feat/1-test";

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

  it("Should create a comment to a Pull Request", async () => {
    github.rest.issues.createComment.mockImplementation(() => ({}));

    await addCommentByPullRequestId(1, "test");

    expect(github.rest.issues.createComment).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.createComment).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      body: "test",
    });
  });

  it("Should create a Pull Request from an Issue", async () => {
    github.context.ref = "refs/heads/feat/1-test";

    fs.readFileSync.mockImplementation(() => "test");

    github.rest.pulls.list.mockImplementation(() => []);
    github.paginate.mockImplementation(() => []);
    github.rest.pulls.create.mockImplementation(() => ({
      number: 1,
      html_url:
        "https://github.com/nebetoxyz/create-pull-request-action/pulls/1",
    }));
    github.rest.issues.addLabels.mockImplementation(() => []);
    github.rest.issues.addAssignees.mockImplementation(() => []);
    github.rest.issues.createComment.mockImplementation(() => ({}));

    await createPullRequest("main", ["fgruchala"], true);

    expect(github.paginate).toHaveBeenCalledTimes(1);
    expect(github.paginate).toHaveBeenCalledWith(github.rest.pulls.list, {
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
    });
    expect(github.rest.pulls.create).toHaveBeenCalledTimes(1);
    expect(github.rest.pulls.create).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      head: "feat/1-test",
      target: "main",
      draft: true,
      maintainer_can_modify: true,
      issue: 1,
    });
    expect(github.rest.issues.addAssignees).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      assignees: ["fgruchala"],
    });
    expect(github.rest.issues.addLabels).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      labels: ["enhancement"],
    });
    expect(github.rest.issues.createComment).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.createComment).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      body: "test",
    });
  });

  it("Should create a Pull Request", async () => {
    github.context.ref = "refs/heads/feat/test";

    fs.readFileSync.mockImplementation(() => "test");

    github.rest.pulls.list.mockImplementation(() => []);
    github.paginate.mockImplementation(() => []);
    github.rest.pulls.create.mockImplementation(() => ({
      number: 1,
      html_url:
        "https://github.com/nebetoxyz/create-pull-request-action/pulls/1",
    }));
    github.rest.issues.addLabels.mockImplementation(() => []);
    github.rest.issues.addAssignees.mockImplementation(() => []);

    await createPullRequest("master", ["fgruchala"], false);

    expect(github.paginate).toHaveBeenCalledTimes(1);
    expect(github.paginate).toHaveBeenCalledWith(github.rest.pulls.list, {
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
    });
    expect(github.rest.pulls.create).toHaveBeenCalledTimes(1);
    expect(github.rest.pulls.create).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      title: "feat: test",
      body: "test",
      head: "feat/test",
      target: "master",
      draft: false,
      maintainer_can_modify: true,
    });
    expect(github.rest.issues.addAssignees).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      assignees: ["fgruchala"],
    });
    expect(github.rest.issues.addLabels).toHaveBeenCalledTimes(1);
    expect(github.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      labels: ["enhancement"],
    });
    expect(github.rest.issues.createComment).toHaveBeenCalledTimes(0);
  });

  it("Should not create a Pull Request because already existing", async () => {
    github.context.ref = "refs/heads/feat/test";

    github.rest.pulls.list.mockImplementation(() => []);
    github.paginate.mockImplementation(() => [
      {
        number: 1,
        html_url:
          "https://github.com/nebetoxyz/create-pull-request--action/pulls/1",
        head: {
          ref: "feat/test",
        },
      },
    ]);

    await createPullRequest("master", ["fgruchala"], false);

    expect(github.paginate).toHaveBeenCalledTimes(1);
    expect(github.paginate).toHaveBeenCalledWith(github.rest.pulls.list, {
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
    });
    expect(github.rest.pulls.create).toHaveBeenCalledTimes(0);
    expect(github.rest.issues.addAssignees).toHaveBeenCalledTimes(0);
    expect(github.rest.issues.addLabels).toHaveBeenCalledTimes(0);
    expect(github.rest.issues.createComment).toHaveBeenCalledTimes(0);
  });
});
