import { jest } from "@jest/globals";

export const paginate = jest.fn();

export const getOctokit = jest.fn((token) => ({
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
