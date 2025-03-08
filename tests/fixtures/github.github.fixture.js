import { jest } from "@jest/globals";

export const paginate = jest.fn();

export const context = {
  repo: {
    owner: "",
    repo: "",
  },
  ref: "",
};

export const actor = "";

export const rest = {
  pulls: {
    list: jest.fn(),
    create: jest.fn(),
  },
  issues: {
    addAssignees: jest.fn(),
    addLabels: jest.fn(),
    createComment: jest.fn(),
  },
};
