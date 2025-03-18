// biome-ignore lint/correctness/noNodejsModules: Fine to use here
import { execSync } from 'node:child_process';

export type BuildInfo = {
  env: {
    VERSION: string;
    COMMIT_HASH: string;
    COMMIT_HASH_PRETTY: string;
  };
};

/**
 * Retrieves build information including version and commit hash.
 * @returns An object containing the build information.
 */
export function getBuildInfo(): BuildInfo {
  // Used to get package.json in the scope of where this is run
  const pkg = require('./package.json');
  const commitHash = execSync('git rev-parse HEAD').toString().trim();

  return {
    env: {
      VERSION: pkg.version,
      COMMIT_HASH: commitHash,
      COMMIT_HASH_PRETTY: commitHash.slice(0, 7),
    },
  };
}
