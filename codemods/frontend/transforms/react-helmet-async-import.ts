import { Transform } from 'jscodeshift';

/**
 * Migrate react-helmet to react-helmet-async.
 *
 * From `import { Helmet } from 'react-helmet'` to `import { Helmet } from 'react-helmet-async'`
 */
const transformer: Transform = (file, api) => {
    const j = api.jscodeshift;
    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    // Get all paths that import from 'settings'
    const importDeclarations = root.find(j.ImportDeclaration)
        .filter(path => path.value.source.value === 'react-helmet');

    importDeclarations.find(j.Literal).forEach((path) => {
        j(path).replaceWith(() => j.stringLiteral('react-helmet-async'))
    });

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    return root.toSource({ quote: 'single' });
};

module.exports = transformer;
