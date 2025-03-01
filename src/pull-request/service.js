import * as github from "@actions/github";
import * as fs from "fs";

/**
 * @typedef PullRequest
 * @type {object}
 * @property {string} id e.g. 1
 * @property {string} url e.g. https://github.com/nebetoxyz/create-pull-request-action/pull/1
 * @property {object} [source]
 * @property {string} source.branch e.g. feat/1-init
 */

/**
 * @typedef Context
 * @type {object}
 * @property {string} owner e.g. nebetoxyz
 * @property {string} repository e.g. create-pull-request-action
 * @property {string} actor e.g. fgruchala
 * @property {object} source
 * @property {string} source.id e.g. 1
 * @property {string} source.type e.g. feat
 * @property {string} source.summary e.g. init
 * @property {string} source.branch e.g. feat/1-init
 */

/**
 * Get {@link Context}.
 * @private
 * @returns {Context}
 */
function _getContext() {
  const { owner, repo } = github.context.repo;
  const actor = github.actor;

  const source = {
    branch: github.context.ref.replace("refs/heads/", ""),
  };

  const [type, ...issue] = source.branch.split("/");
  const [id, summary] = issue[0].match(/(\d*)-?([\w\-_]*)/).slice(1);

  source;

  return {
    owner,
    repository: repo,
    actor,
    source: {
      id,
      type,
      summary,
      ...source,
    },
  };
}

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
  const { owner, repository } = _getContext();

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
 * @param {string} targetBranch Must be an existing branch e.g. main
 * @param {string} assignee Must be an existing Github user e.g. fgruchala
 * @param {boolean} isDraft e.g. true
 * @returns {Promise<PullRequest>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const { id, url } = await createPullRequest('main', 'fgruchala', true);
 */
export async function createPullRequest(targetBranch, assignee, isDraft) {
  const { owner, repository, actor, source } = _getContext();

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

  const bodyTemplate = fs.readFileSync(
    ".github/pull_request_template.md",
    "utf-8"
  );

  const data = {
    owner,
    repo: repository,
    title:
      source.id === ""
        ? `${source.type}: ${source.summary}`
        : `${source.type}(#${source.id}): ${source.summary}`,
    body: bodyTemplate
      .replaceAll("{CREATOR}", `@${actor}`)
      .replaceAll(
        "{ISSUE_TICKET_ID}",
        source.id === "" ? `NC` : `#${source.id}`
      ),
    head: source.branch,
    target: targetBranch,
    draft: isDraft,
    maintainer_can_modify: true,
  };

  const { number: id, html_url: url } = await github.rest.pulls
    .create(data)
    .then((res) => res.data);

  await Promise.all([
    addAssigneesByPullRequestId(id, [assignee]),
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
 * @param {number} id e.g. 1
 * @param {string[]} assignees Must be existing Github users e.g. [fgruchala]
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addAssigneesByPullRequestId(1, ['fgruchala']);
 */
export function addAssigneesByPullRequestId(id, assignees) {
  const { owner, repository } = _getContext();

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
 * @param {number} id e.g. 1
 * @param {string[]} labels e.g. [bug]
 * @returns {Promise<any>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * await addLabelsByPullRequestId(1, ['bug']);
 */
export function addLabelsByPullRequestId(id, labels) {
  const { owner, repository } = _getContext();

  return github.rest.issues.addLabels({
    owner,
    repo: repository,
    issue_number: id,
    labels,
  });
}
