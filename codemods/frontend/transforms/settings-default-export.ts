import { Transform } from 'jscodeshift';

/**
 * Migrate default settings export to use named version instead.
 *
 * From `import SETTINGS from 'settings'` to `import { SETTINGS } from 'settings'`
 */
const transform: Transform = (file, api) => {
    const j = api.jscodeshift;
    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    // Get all paths that import from 'settings'
    const settingsImports = root
        .find(j.ImportDeclaration)
        .filter(path => path.value.source.value === 'settings')
        .find(j.ImportDefaultSpecifier);

    settingsImports.forEach((path) => {
        const name = path.value.local?.name;

        if (name) {
            j(path).replaceWith(() => [j.importSpecifier(j.identifier(name))]);
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
