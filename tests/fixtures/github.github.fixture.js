import { jest } from "@jest/globals";

export const getOctokit = jest.fn((token) => ({
  paginate: jest.fn(),
  rest: {
    pulls: {
      list: jest.fn(),
      create: jest.fn(),
    },
    issues: {
      addAssignees: jest.fn(),
      addLabels: jest.fn(),
      createComment: jest.fn(),
    },
  },
}));

export const context = {
  repo: {
    owner: "",
    repo: "",
  },
  ref: "",
};
