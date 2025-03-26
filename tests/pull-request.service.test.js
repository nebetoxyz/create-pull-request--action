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
  it("Should list existing Pull Requests", async () => {
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
    };

    context.client.rest.pulls.list.mockImplementation(() => []);
    context.client.paginate.mockImplementation(() => [
      {
        number: 1,
        html_url:
          "https://github.com/nebetoxyz/create-pull-request--action/pulls/1",
        head: {
          ref: "feat/1-test",
        },
      },
    ]);

    const pullRequests = await getAllPullRequests(context);

    expect(context.client.paginate).toHaveBeenCalledTimes(1);
    expect(context.client.paginate).toHaveBeenCalledWith(
      context.client.rest.pulls.list,
      {
        owner: "nebetoxyz",
        repo: "create-pull-request--action",
      }
    );

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
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
    };

    context.client.rest.issues.addAssignees.mockImplementation(() => []);

    await addAssigneesByPullRequestId(context, 1, ["fgruchala"]);

    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      assignees: ["fgruchala"],
    });
  });

  it("Should add labels to a Pull Request", async () => {
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
    };

    context.client.rest.issues.addLabels.mockImplementation(() => []);

    await addLabelsByPullRequestId(context, 1, ["bug"]);

    expect(context.client.rest.issues.addLabels).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      labels: ["bug"],
    });
  });

  it("Should create a comment to a Pull Request", async () => {
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
    };

    context.client.rest.issues.createComment.mockImplementation(() => ({}));

    await addCommentByPullRequestId(context, 1, "test");

    expect(context.client.rest.issues.createComment).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.createComment).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      body: "test",
    });
  });

  it("Should create a Pull Request from an Issue", async () => {
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
      source: {
        id: 1,
        type: "feat",
        summary: "test",
        branch: "feat/1-test",
      },
    };

    fs.readFileSync.mockImplementation(() => "test");

    context.client.paginate.mockImplementation(() => []);
    context.client.rest.pulls.list.mockImplementation(() => []);
    context.client.rest.pulls.create.mockImplementation(() => ({
      data: {
        number: 1,
        html_url:
          "https://github.com/nebetoxyz/create-pull-request-action/pulls/1",
      },
    }));
    context.client.rest.issues.addLabels.mockImplementation(() => []);
    context.client.rest.issues.addAssignees.mockImplementation(() => []);
    context.client.rest.issues.createComment.mockImplementation(() => ({}));

    await createPullRequest(context, "main", ["fgruchala"], true);

    expect(context.client.paginate).toHaveBeenCalledTimes(1);
    expect(context.client.paginate).toHaveBeenCalledWith(
      context.client.rest.pulls.list,
      {
        owner: "nebetoxyz",
        repo: "create-pull-request--action",
      }
    );
    expect(context.client.rest.pulls.create).toHaveBeenCalledTimes(1);
    expect(context.client.rest.pulls.create).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      head: "feat/1-test",
      base: "main",
      draft: true,
      maintainer_can_modify: true,
      issue: 1,
    });
    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      assignees: ["fgruchala"],
    });
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      labels: ["enhancement"],
    });
    expect(context.client.rest.issues.createComment).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.createComment).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      body: "test",
    });
  });

  it("Should create a Pull Request", async () => {
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
      source: {
        type: "feat",
        summary: "test",
        branch: "feat/test",
      },
    };

    fs.readFileSync.mockImplementation(() => "test");

    context.client.paginate.mockImplementation(() => []);
    context.client.rest.pulls.list.mockImplementation(() => []);
    context.client.rest.pulls.create.mockImplementation(() => ({
      data: {
        number: 1,
        html_url:
          "https://github.com/nebetoxyz/create-pull-request-action/pulls/1",
      },
    }));
    context.client.rest.issues.addLabels.mockImplementation(() => []);
    context.client.rest.issues.addAssignees.mockImplementation(() => []);

    await createPullRequest(context, "master", ["fgruchala"], false);

    expect(context.client.paginate).toHaveBeenCalledTimes(1);
    expect(context.client.paginate).toHaveBeenCalledWith(
      context.client.rest.pulls.list,
      {
        owner: "nebetoxyz",
        repo: "create-pull-request--action",
      }
    );
    expect(context.client.rest.pulls.create).toHaveBeenCalledTimes(1);
    expect(context.client.rest.pulls.create).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      title: "feat: test",
      body: "test",
      head: "feat/test",
      base: "master",
      draft: false,
      maintainer_can_modify: true,
    });
    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      assignees: ["fgruchala"],
    });
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      labels: ["enhancement"],
    });
    expect(context.client.rest.issues.createComment).toHaveBeenCalledTimes(0);
  });

  it("Should create a Pull Request without assignees", async () => {
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
      source: {
        type: "feat",
        summary: "test",
        branch: "feat/test",
      },
    };

    fs.readFileSync.mockImplementation(() => "test");

    context.client.paginate.mockImplementation(() => []);
    context.client.rest.pulls.list.mockImplementation(() => []);
    context.client.rest.pulls.create.mockImplementation(() => ({
      data: {
        number: 1,
        html_url:
          "https://github.com/nebetoxyz/create-pull-request-action/pulls/1",
      },
    }));
    context.client.rest.issues.addLabels.mockImplementation(() => []);

    await createPullRequest(context, "master", [], false);

    expect(context.client.paginate).toHaveBeenCalledTimes(1);
    expect(context.client.paginate).toHaveBeenCalledWith(
      context.client.rest.pulls.list,
      {
        owner: "nebetoxyz",
        repo: "create-pull-request--action",
      }
    );
    expect(context.client.rest.pulls.create).toHaveBeenCalledTimes(1);
    expect(context.client.rest.pulls.create).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      title: "feat: test",
      body: "test",
      head: "feat/test",
      base: "master",
      draft: false,
      maintainer_can_modify: true,
    });
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledTimes(1);
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "nebetoxyz",
      repo: "create-pull-request--action",
      issue_number: 1,
      labels: ["enhancement"],
    });
    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledTimes(0);
    expect(context.client.rest.issues.createComment).toHaveBeenCalledTimes(0);
  });

  it("Should not create a Pull Request because already existing", async () => {
    const context = {
      client: github.getOctokit("***"),
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
      source: {
        type: "feat",
        summary: "test",
        branch: "feat/test",
      },
    };

    context.client.rest.pulls.list.mockImplementation(() => []);
    context.client.paginate.mockImplementation(() => [
      {
        number: 1,
        html_url:
          "https://github.com/nebetoxyz/create-pull-request--action/pulls/1",
        head: {
          ref: "feat/test",
        },
      },
    ]);

    await createPullRequest(context, "master", ["fgruchala"], false);

    expect(context.client.paginate).toHaveBeenCalledTimes(1);
    expect(context.client.paginate).toHaveBeenCalledWith(
      context.client.rest.pulls.list,
      {
        owner: "nebetoxyz",
        repo: "create-pull-request--action",
      }
    );
    expect(context.client.rest.pulls.create).toHaveBeenCalledTimes(0);
    expect(context.client.rest.issues.addAssignees).toHaveBeenCalledTimes(0);
    expect(context.client.rest.issues.addLabels).toHaveBeenCalledTimes(0);
    expect(context.client.rest.issues.createComment).toHaveBeenCalledTimes(0);
  });
});
