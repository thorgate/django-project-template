import path from 'path';

// Resolves to <projectRoot>/app
export const appDir = path.resolve(path.join(__dirname, '..'));

/**
 * Resolve file or directory in <root>/app
 * @param relativePath
 * @returns {string}
 */
export const resolveApp = relativePath => path.resolve(appDir, relativePath);

// Resolves to <projectRoot>/app/public
export const publicDir = resolveApp('public');

// Resolves to <projectRoot>/app/build/loadable-stats.json
export const statsFile = resolveApp('build/loadable-stats.json');
