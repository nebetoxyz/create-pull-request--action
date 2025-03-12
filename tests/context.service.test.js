import { expect, jest } from "@jest/globals";

import * as github from "./fixtures/github.github.fixture.js";

jest.unstable_mockModule("@actions/github", () => github);

const { getContext } = await import("../src/context/service.js");

describe("Default", () => {
  beforeEach(() => {
    github.context.repo.owner = "nebetoxyz";
    github.context.repo.repo = "create-pull-request--action";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Should get context", async () => {
    github.context.ref = "refs/heads/feat/1-test";

    const context = getContext();

    expect(context).toStrictEqual({
      owner: "nebetoxyz",
      repository: "create-pull-request--action",
      source: { branch: "feat/1-test", id: 1, summary: "test", type: "feat" },
    });
  });
});
