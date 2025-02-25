const github = require("@actions/github");
const fs = require("fs");

/**
 * @typedef PullRequest
 * @type {object}
 * @property {string} id e.g. 1
 * @property {string} url e.g. https://github.com/nebetoxyz/create-pull-request-action/pull/1
 */

/**
 * @typedef Context
 * @type {object}
 * @property {string} owner e.g. nebetoxyz
 * @property {string} repository e.g. create-pull-request-action
 * @property {string} actor e.g. fgruchala
 */

/**
 * Get {@link Context}.
 * @private
 * @returns {Context}
 */
function _getContext() {
  const { owner, repo } = github.context.repo;
  const actor = github.actor;

  return { owner, repository: repo, actor };
}

/**
 * Get all {@link PullRequest}.
 * Restrict to the current {@link Context}.
 * @returns {Promise<PullRequest[]>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const pullRequests = await getAllPullRequests();
 */
export function getAllPullRequests() {
  const { owner, repository } = _getContext();

  return github.paginate(github.rest.pulls.list, {
    owner,
    repo: repository,
  });
}

/**
 * Get one {@link PullRequest} by its {@link sourceBranch}.
 * Restrict to the current {@link Context}.
 * @param {string} sourceBranch e.g. feat/1-init
 * @returns {Promise<PullRequest|undefined>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const pullRequest = await getPullRequestBySourceBranch('refs/heads/feat/1-init');
 * const pullRequest = await getPullRequestBySourceBranch('feat/1-init');
 */
export async function getPullRequestBySourceBranch(sourceBranch) {
  const pullRequests = await getAllPullRequests();
  sourceBranch = sourceBranch.replace("refs/heads/", "");

  const pullRequest = pullRequests.find(
    (pullRequest) => pullRequest.head.ref === sourceBranch
  );

  return pullRequest
    ? { id: pullRequest.number, url: pullRequest.html_url }
    : undefined;
}

/**
 * Create a new {@link PullRequest}.
 * Restrict to the current {@link Context}.
 * @param {string} sourceBranch Must be an existing branch and match (refs/heads/)?(feat|fix|docs`ci|chore)/(\d*)-?([\w\-_]*) e.g. feat/1-init
 * @param {string} targetBranch Must be an existing branch e.g. main
 * @param {string} assignee Must be an existing Github user e.g. fgruchala
 * @param {boolean} isDraft e.g. true
 * @returns {Promise<PullRequest>}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const { id, url } = await createPullRequest('refs/heads/feat/1-init', 'main', 'fgruchala', true);
 */
export async function createPullRequest(
  sourceBranch,
  targetBranch,
  assignee,
  isDraft
) {
  const { owner, repository, actor } = _getContext();

  const [type, ...issue] = sourceBranch.replace("refs/heads/", "").split("/");
  const [_, id, summary] = issue[0].match(/(\d*)-?([\w\-_]*)/);

  const labels = {
    fix: "bug",
    feat: "enhancement",
    docs: "documentation",
    ci: "ci/cd",
    chore: "configuration",
  };

  const existingPullRequest = await getPullRequestBySourceBranch(sourceBranch);

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
      id === ""
        ? `${type}: ${summary.replaceAll("-", " ")}`
        : `${type}(#${id}): ${summary.replaceAll("-", " ")}`,
    body: bodyTemplate
      .replaceAll("{CREATOR}", `@${actor}`)
      .replaceAll("{ISSUE_TICKET_ID}", id === "" ? `NC` : `#${id}`),
    head: sourceBranch,
    target: targetBranch,
    draft: isDraft,
    maintainer_can_modify: true,
  };

  const newlyCreatedPullRequest = ({ id: number, url: html_url } =
    await github.rest.pulls.create(data).then((res) => res.data));

  await Promise.all([
    addAssigneesByPullRequestId(id, [assignee]),
    addLabelsByPullRequestId(id, [labels[type]]),
  ]);

  return newlyCreatedPullRequest;
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
