import * as github from "@actions/github";
import * as fs from "fs";

import { getContext } from "../context/service";

/**
 * @typedef PullRequest
 * @type {object}
 * @property {string} id e.g. "1"
 * @property {string} url e.g. "https://github.com/nebetoxyz/create-pull-request-action/pull/1"
 * @property {object} [source]
 * @property {string} source.branch e.g. "feat/1-init"
 */

/**
 * Get all {@link PullRequest}.
 * Restrict to the current {@link Context}.
 * @returns {Promise<PullRequest[]>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const [{id, url, source}, ...] = await getAllPullRequests();
 */
export async function getAllPullRequests() {
  const { owner, repository } = getContext();

  const pullRequests = await github.paginate(github.rest.pulls.list, {
    owner,
    repo: repository,
  });

  return pullRequests.map((pullRequest) => ({
    id: pullRequest.number,
    url: pullRequest.html_url,
    source: {
      branch: pullRequest.head.ref,
    },
  }));
}

/**
 * Create a new {@link PullRequest}.
 * Restrict to the current {@link Context}.
 * @param {string} targetBranch Must be an existing branch e.g. "main"
 * @param {string[]} assignees Must be existing Github users e.g. ["fgruchala"]
 * @param {boolean} isDraft e.g. true
 * @returns {Promise<PullRequest>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const { id, url } = await createPullRequest('main', ['fgruchala'], true);
 */
export async function createPullRequest(targetBranch, assignees, isDraft) {
  const { owner, repository, source } = getContext();

  const labels = {
    fix: ["bug"],
    feat: ["enhancement"],
    docs: ["documentation"],
    ci: ["ci/cd"],
    chore: ["configuration"],
    test: ["enhancement", "enhancement:minor"],
    perf: ["enhancement", "enhancement:minor"],
    refactor: ["enhancement", "enhancement:minor"],
    revert: [],
    style: ["enhancement", "enhancement:minor"],
  };

  const pullRequests = await getAllPullRequests();
  const existingPullRequest = pullRequests.find(
    (pullRequest) => pullRequest.source.branch === source.branch
  );

  if (existingPullRequest) {
    return existingPullRequest;
  }

  const data = {
    owner,
    repo: repository,
    head: source.branch,
    target: targetBranch,
    draft: isDraft,
    maintainer_can_modify: true,
  };

  const comment = fs.readFileSync(".github/PULL_REQUEST_TEMPLATE.md", "utf-8");

  if (source.id) {
    data["issue"] = source.id;
  } else {
    data["title"] = `${source.type}: ${source.summary}`;
    data["body"] = comment;
  }

  const { number: id, html_url: url } = await github.rest.pulls.create(data);

  await Promise.all([
    source.id ? addCommentByPullRequestId(id, comment) : Promise.resolve(),
    addAssigneesByPullRequestId(id, assignees),
    addLabelsByPullRequestId(id, labels[source.type]),
  ]);

  return {
    id,
    url,
    source,
  };
}

/**
 * Assign one or more {@link assignees} to a {@link PullRequest}.
 * Restrict to the current {@link Context}.
 * @param {number} id e.g. "1"
 * @param {string[]} assignees Must be existing Github users e.g. ["fgruchala"]
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addAssigneesByPullRequestId(1, ['fgruchala']);
 */
export function addAssigneesByPullRequestId(id, assignees) {
  const { owner, repository } = getContext();

  return github.rest.issues.addAssignees({
    owner,
    repo: repository,
    issue_number: id,
    assignees,
  });
}

/**
 * Assign one or more {@link labels} to a {@link PullRequest}.
 * Restrict to the current {@link Context}.
 * @param {number} id e.g. "1"
 * @param {string[]} labels e.g. ["bug"]
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addLabelsByPullRequestId(1, ['bug']);
 */
export function addLabelsByPullRequestId(id, labels) {
  const { owner, repository } = getContext();

  return github.rest.issues.addLabels({
    owner,
    repo: repository,
    issue_number: id,
    labels,
  });
}

/**
 * Add a {@link comment} to a {@link PullRequest}.
 * Restrict to the current {@link Context}.
 * @param {number} id e.g. "1"
 * @param {string} comment
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addCommentByPullRequestId(1, "...");
 */
export function addCommentByPullRequestId(id, comment) {
  const { owner, repository } = getContext();

  return github.rest.issues.createComment({
    owner,
    repo: repository,
    issue_number: id,
    body: comment,
  });
}
