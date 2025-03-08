import { expect, jest } from "@jest/globals";

import * as core from "./fixtures/github.core.fixture.js";

jest.unstable_mockModule("@actions/core", () => core);
jest.unstable_mockModule("../src/pull-request/service", () => ({
  createPullRequest: jest.fn(),
}));

const { main } = await import("../src/main.js");
const { createPullRequest } = await import("../src/pull-request/service.js");

describe("Default", () => {
  beforeEach(() => {
    const input = {
      "to-branch": "main",
      assignees: "fgruchala\ntest",
      "is-draft": true,
    };

    core.getInput.mockImplementation((id) => input[id]);
    core.getBooleanInput.mockImplementation((id) => input[id]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Should create a Pull Request", async () => {
    createPullRequest.mockImplementation(() => ({
      id: 1,
      url: "https://github.com/nebetoxyz/create-pull-request-action/pulls/1",
    }));

    await main();

    expect(core.getInput).toHaveBeenCalledTimes(2);
    expect(core.getInput).toHaveBeenCalledWith("to-branch");
    expect(core.getInput).toHaveBeenCalledWith("assignees");

    expect(core.getBooleanInput).toHaveBeenCalledTimes(1);
    expect(core.getBooleanInput).toHaveBeenCalledWith("is-draft");

    expect(createPullRequest).toHaveBeenCalledTimes(1);
    expect(createPullRequest).toHaveBeenCalledWith(
      "main",
      ["fgruchala", "test"],
      true
    );

    expect(core.setOutput).toHaveBeenCalledTimes(2);
    expect(core.setOutput).toHaveBeenCalledWith("id", 1);
    expect(core.setOutput).toHaveBeenCalledWith(
      "url",
      "https://github.com/nebetoxyz/create-pull-request-action/pulls/1"
    );
  });

  it("Should failed", async () => {
    createPullRequest.mockImplementation(() => {
      throw new Error("Something went wrong");
    });

    await main();

    expect(core.getInput).toHaveBeenCalledTimes(2);
    expect(core.getInput).toHaveBeenCalledWith("to-branch");
    expect(core.getInput).toHaveBeenCalledWith("assignees");

    expect(core.getBooleanInput).toHaveBeenCalledTimes(1);
    expect(core.getBooleanInput).toHaveBeenCalledWith("is-draft");

    expect(createPullRequest).toHaveBeenCalledTimes(1);
    expect(createPullRequest).toHaveBeenCalledWith(
      "main",
      ["fgruchala", "test"],
      true
    );

    expect(core.setOutput).toHaveBeenCalledTimes(0);

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith("Something went wrong");
  });
});
