import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_REPO_NAME = 'axolync-platform-wrapper';
const EXPECTED_REMOTE_SUFFIX = '/korenmic/axolync-platform-wrapper.git';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function remoteUrl(root) {
  try {
    return execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

export function verifyWrapperIdentity({ root = repoRoot } = {}) {
  const failures = [];
  const packageJson = readJson(path.join(root, 'package.json'));
  const authority = readJson(path.join(root, 'config', 'wrapper-authority.json'));
  const folderName = path.basename(root);
  const origin = remoteUrl(root);

  if (folderName !== EXPECTED_REPO_NAME) {
    failures.push(`local checkout folder must be ${EXPECTED_REPO_NAME}: ${folderName}`);
  }
  if (packageJson.name !== EXPECTED_REPO_NAME) {
    failures.push(`package name must be ${EXPECTED_REPO_NAME}: ${packageJson.name}`);
  }
  if (authority.currentPhysicalRepo !== EXPECTED_REPO_NAME) {
    failures.push(`currentPhysicalRepo must be ${EXPECTED_REPO_NAME}: ${authority.currentPhysicalRepo}`);
  }
  if (origin && !origin.replaceAll('\\', '/').endsWith(EXPECTED_REMOTE_SUFFIX)) {
    failures.push(`origin must point at ${EXPECTED_REPO_NAME}: ${origin}`);
  }

  return {
    ok: failures.length === 0,
    failures,
    identity: {
      folderName,
      packageName: packageJson.name,
      currentPhysicalRepo: authority.currentPhysicalRepo,
      origin,
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const result = verifyWrapperIdentity();
  if (!result.ok) {
    for (const failure of result.failures) console.error(failure);
    process.exit(1);
  }
  console.log(`Wrapper identity verified: ${JSON.stringify(result.identity)}`);
}
