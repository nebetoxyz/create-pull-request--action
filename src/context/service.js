import * as github from "@actions/github";

/**
 * @typedef Context
 * @type {object}
 * @property {object} client
 * @property {string} owner e.g. "nebetoxyz"
 * @property {string} repository e.g. "create-pull-request-action"
 * @property {string} actor e.g. "fgruchala"
 * @property {object} source
 * @property {number} [source.id] e.g. "1"
 * @property {string} source.type e.g. "feat"
 * @property {string} source.summary e.g. "init"
 * @property {string} source.branch e.g. "feat/1-init"
 */

/**
 * Get {@link Context}.
 * @param {string} token
 * @returns {Context}
 *
 * @author Francois GRUCHALA <francois@nebeto.xyz>
 *
 * @example
 * const {client, owner, repository, source} = getContext("xxx");
 */
export function getContext(token) {
  const { owner, repo } = github.context.repo;

  const source = {
    branch: github.context.ref.replace("refs/heads/", ""),
  };

  const [type, ...issue] = source.branch.split("/");
  const [id, summary] = /(\d*)-?([\w-]*)/.exec(issue[0]).slice(1);

  return {
    client: github.getOctokit(token),
    owner,
    repository: repo,
    source: {
      id: id === "" ? undefined : +id,
      type,
      summary,
      ...source,
    },
  };
}
