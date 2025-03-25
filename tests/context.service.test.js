import { expect, jest } from "@jest/globals";

import * as github from "./fixtures/github.github.fixture.js";

jest.unstable_mockModule("@actions/github", () => github);

const { getContext } = await import("../src/context/service.js");

describe("Default", () => {
  beforeEach(() => {
    github.context.repo.owner = "nebetoxyz";
    github.context.repo.repo = "create-pull-request--action";
  });

  it("Should get context with an Issue", async () => {
    github.context.ref = "refs/heads/feat/1-test";

    const context = getContext();

    expect(context.client).toBeDefined();
    expect(context.owner).toStrictEqual("nebetoxyz");
    expect(context.repository).toStrictEqual("create-pull-request--action");
    expect(context.source).toStrictEqual({
      branch: "feat/1-test",
      id: 1,
      summary: "test",
      type: "feat",
    });
  });

  it("Should get context without an Issue", async () => {
    github.context.ref = "refs/heads/feat/test";

    const context = getContext();

    expect(context.client).toBeDefined();
    expect(context.owner).toStrictEqual("nebetoxyz");
    expect(context.repository).toStrictEqual("create-pull-request--action");
    expect(context.source).toStrictEqual({
      branch: "feat/test",
      id: undefined,
      summary: "test",
      type: "feat",
    });
  });
});
