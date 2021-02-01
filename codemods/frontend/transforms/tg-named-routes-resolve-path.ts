import { Transform } from 'jscodeshift';

/**
 * Migrate `tg-named-routes` to use not renamed import.
 *
 * From:
 *   import { resolvePath as urlResolve } from 'tg-named-routes';
 *   ...
 *   urlResolve('path:a');
 *
 * To:
 *   import { resolvePath } from 'tg-named-routes';
 *   ...
 *   resolvePath('path:a');
 */
const transform: Transform = (file, api) => {
    const j = api.jscodeshift;
    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    // Remove aliased import name
    root
        .find(j.ImportDeclaration)
        .filter(path => path.value.source.value === 'tg-named-routes')
        .find(j.ImportSpecifier)
        .forEach((path) => {
            const importedName = path.value.imported?.name;
            const localName = path.value.local?.name;

            if (importedName === 'resolvePath' && localName === 'urlResolve') {
                j(path).replaceWith(() => [j.importSpecifier(j.identifier(importedName))]);
            }
        });

    // Rename function calls to resolvePath
    root
        .find(j.CallExpression)
        .filter((path) => {
            return 'name' in path.value.callee && path.value.callee.name === 'urlResolve';
        })
        .forEach((path) => {
            if ('name' in path.value.callee) {
                path.value.callee.name = 'resolvePath';
            }
        });

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    return root.toSource({ quote: 'single' });
};

module.exports = transform;
