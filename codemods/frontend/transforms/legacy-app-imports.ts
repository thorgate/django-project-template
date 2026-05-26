import { Transform } from 'jscodeshift';
import * as console from "console";

/**
 * Migrate root imports to use local prefix instead.
 *
 * From:
 *     import Something from 'components/Something';
 *
 * To:
 *     import Something from '@/src/components/Something';
 */
const transformer: Transform = (file, api) => {
    const j = api.jscodeshift;
    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    const knownPaths: Array<any> = [
        'client',
        'components',
        'configuration',
        'containers',
        'decorators',
        'ducks',
        'forms',
        'sagas',
        'server',
        'services',
        'styles',
        'utils',
        'views',
        'index',
        'logger',
        'settings',
    ];

    // Get all paths that import from 'settings'
    const importDeclarations = root.find(j.ImportDeclaration)
        .filter(path => knownPaths.some(p => (
            path.value.source.value === p || typeof path.value.source.value === 'string' && path.value.source.value.startsWith(p + '/')
        )));

    importDeclarations.find(j.Literal).forEach((path) => {
        j(path).replaceWith(path => {
            return j.stringLiteral('@/src/' + path.value.value)
        })
    });

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    return root.toSource({ quote: 'single' });
};

module.exports = transformer;
