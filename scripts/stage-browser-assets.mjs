import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(repoRoot, 'app', 'src', 'main', 'assets', 'public');

export function resolveSourceRoot(currentRepoRoot = repoRoot) {
  const builderNormal = process.env.AXOLYNC_BUILDER_BROWSER_NORMAL?.trim();
  if (builderNormal) {
    return path.resolve(builderNormal);
  }
  return path.resolve(currentRepoRoot, '..', 'axolync-browser', 'dist');
}

export function resolveDemoAssetsRoot(currentRepoRoot = repoRoot) {
  const builderDemo = process.env.AXOLYNC_BUILDER_BROWSER_DEMO?.trim();
  if (builderDemo) {
    const demoAssets = path.resolve(builderDemo, 'demo', 'assets');
    if (fs.existsSync(demoAssets)) {
      return demoAssets;
    }
  }
  const fallback = path.resolve(currentRepoRoot, '..', 'axolync-browser', 'demo', 'assets');
  return fs.existsSync(fallback) ? fallback : null;
}

export function resolveDemoPluginsRoot(currentRepoRoot = repoRoot) {
  const builderDemo = process.env.AXOLYNC_BUILDER_BROWSER_DEMO?.trim();
  if (builderDemo) {
    const demoPlugins = path.resolve(builderDemo, 'demo', 'plugins');
    if (fs.existsSync(demoPlugins)) {
      return demoPlugins;
    }
  }
  const fallback = path.resolve(currentRepoRoot, '..', 'axolync-browser', 'demo', 'plugins');
  return fs.existsSync(fallback) ? fallback : null;
}

export function resolveDemoPlayerHtml(currentRepoRoot = repoRoot) {
  const builderDemo = process.env.AXOLYNC_BUILDER_BROWSER_DEMO?.trim();
  if (builderDemo) {
    const demoPlayer = path.resolve(builderDemo, 'demo', 'player.html');
    if (fs.existsSync(demoPlayer)) {
      return demoPlayer;
    }
  }
  const fallback = path.resolve(currentRepoRoot, '..', 'axolync-browser', 'demo', 'player.html');
  return fs.existsSync(fallback) ? fallback : null;
}

function ensureRequiredBrowserFiles(sourceRoot) {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Browser source root not found: ${sourceRoot}`);
  }
  if (!fs.existsSync(path.join(sourceRoot, 'index.html'))) {
    throw new Error(`Browser source root is missing index.html: ${sourceRoot}`);
  }
}

export function stageBrowserAssets(options = {}) {
  const sourceRoot = options.sourceRoot ?? resolveSourceRoot();
  const targetPublicDir = options.publicDir ?? publicDir;
  const demoAssetsRoot = options.demoAssetsRoot ?? resolveDemoAssetsRoot();
  const demoPluginsRoot = options.demoPluginsRoot ?? resolveDemoPluginsRoot();
  const demoPlayerHtml = options.demoPlayerHtml ?? resolveDemoPlayerHtml();

  ensureRequiredBrowserFiles(sourceRoot);

  fs.rmSync(targetPublicDir, { recursive: true, force: true });
  fs.mkdirSync(targetPublicDir, { recursive: true });
  fs.cpSync(sourceRoot, targetPublicDir, { recursive: true });

  if (demoAssetsRoot) {
    const demoTarget = path.join(targetPublicDir, 'demo', 'assets');
    fs.mkdirSync(demoTarget, { recursive: true });
    fs.cpSync(demoAssetsRoot, demoTarget, { recursive: true });
  }

  if (demoPluginsRoot) {
    const demoTarget = path.join(targetPublicDir, 'demo', 'plugins');
    fs.mkdirSync(demoTarget, { recursive: true });
    fs.cpSync(demoPluginsRoot, demoTarget, { recursive: true });
  }

  if (demoPlayerHtml) {
    const playerTarget = path.join(targetPublicDir, 'demo', 'player.html');
    fs.mkdirSync(path.dirname(playerTarget), { recursive: true });
    fs.copyFileSync(demoPlayerHtml, playerTarget);
  }

  for (const stubName of ['cordova.js', 'cordova_plugins.js']) {
    const stubPath = path.join(targetPublicDir, stubName);
    if (!fs.existsSync(stubPath)) {
      fs.writeFileSync(stubPath, '', 'utf8');
    }
  }

  return {
    sourceRoot,
    publicDir: targetPublicDir,
    demoAssetsRoot,
    demoPluginsRoot,
    demoPlayerHtml,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  stageBrowserAssets();
}
