import * as fs from "fs";

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
 * @param {Context} context
 * @returns {Promise<PullRequest[]>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const [{id, url, source}, ...] = await getAllPullRequests(context);
 */
export async function getAllPullRequests(context) {
  const pullRequests = await context.client.paginate(
    context.client.rest.pulls.list,
    {
      owner: context.owner,
      repo: context.repository,
    }
  );

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
 * @param {Context} context
 * @param {string} targetBranch Must be an existing branch e.g. "main"
 * @param {string[]=} assignees Must be existing Github users e.g. ["fgruchala"]
 * @param {boolean} isDraft e.g. true
 * @returns {Promise<PullRequest>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const { id, url } = await createPullRequest(context, 'main', ['fgruchala'], true);
 */
export async function createPullRequest(
  context,
  targetBranch,
  assignees,
  isDraft
) {
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

  const pullRequests = await getAllPullRequests(context);
  const existingPullRequest = pullRequests.find(
    (pullRequest) => pullRequest.source.branch === context.source.branch
  );

  if (existingPullRequest) {
    return existingPullRequest;
  }

  const data = {
    owner: context.owner,
    repo: context.repository,
    head: context.source.branch,
    target: targetBranch,
    draft: isDraft,
    maintainer_can_modify: true,
  };

  const comment = fs.readFileSync(".github/PULL_REQUEST_TEMPLATE.md", "utf-8");

  if (context.source.id) {
    data["issue"] = context.source.id;
  } else {
    data["title"] = `${context.source.type}: ${context.source.summary}`;
    data["body"] = comment;
  }

  const { number: id, html_url: url } = await context.client.rest.pulls.create(
    data
  );

  await Promise.all([
    context.source.id
      ? addCommentByPullRequestId(context, id, comment)
      : Promise.resolve(),
    assignees && assignees.length > 0
      ? addAssigneesByPullRequestId(context, id, assignees)
      : Promise.resolve(),
    addLabelsByPullRequestId(context, id, labels[context.source.type]),
  ]);

  return {
    id,
    url,
    source: context.source,
  };
}

/**
 * Assign one or more {@link assignees} to a {@link PullRequest}.
 * @param {Context} context
 * @param {number} id e.g. "1"
 * @param {string[]} assignees Must be existing Github users e.g. ["fgruchala"]
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addAssigneesByPullRequestId(context, 1, ['fgruchala']);
 */
export function addAssigneesByPullRequestId(context, id, assignees) {
  return context.client.rest.issues.addAssignees({
    owner: context.owner,
    repo: context.repository,
    issue_number: id,
    assignees,
  });
}

/**
 * Assign one or more {@link labels} to a {@link PullRequest}.
 * @param {Context} context
 * @param {number} id e.g. "1"
 * @param {string[]} labels e.g. ["bug"]
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addLabelsByPullRequestId(context, 1, ['bug']);
 */
export function addLabelsByPullRequestId(context, id, labels) {
  return context.client.rest.issues.addLabels({
    owner: context.owner,
    repo: context.repository,
    issue_number: id,
    labels,
  });
}

/**
 * Add a {@link comment} to a {@link PullRequest}.
 * @param {Context} context
 * @param {number} id e.g. "1"
 * @param {string} comment
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addCommentByPullRequestId(context, 1, "...");
 */
export function addCommentByPullRequestId(context, id, comment) {
  return context.client.rest.issues.createComment({
    owner: context.owner,
    repo: context.repository,
    issue_number: id,
    body: comment,
  });
}
