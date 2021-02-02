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

    const source = 'tg-named-routes';
    const importName = 'resolvePath';
    const specifier = j.importSpecifier(j.identifier('resolvePath'))

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    // Rename function calls to resolvePath
    const replaceCalls = root
        .find(j.CallExpression)
        .filter((path) => {
            return 'name' in path.value.callee && path.value.callee.name === 'urlResolve';
        });
    const hasCalls = replaceCalls.size() > 0;
    replaceCalls
        .forEach((path) => {
            if ('name' in path.value.callee) {
                path.value.callee.name = 'resolvePath';
            }
        });

    // Remove aliased import name
    const validImports = root
        .find(j.ImportDeclaration)
        .filter(path => path.value.source.value === 'tg-named-routes');
    const hasCorrectImports = validImports.size() > 0;
    const missingCorrectImport = validImports
        .find(j.ImportSpecifier)
        .filter(path => (
            path.value.imported?.name === importName
        )).size() === 0;
    validImports
        .find(j.ImportSpecifier)
        .forEach((path) => {
            const importedName = path.value.imported?.name;
            const localName = path.value.local?.name;

            if (importedName === 'resolvePath' && localName === 'urlResolve') {
                j(path).replaceWith(() => [j.importSpecifier(j.identifier(importedName))]);
            }
        });
    const invalidImports = root
        .find(j.ImportDeclaration)
        .filter(path => (
            typeof path.value.source.value === 'string' && path.value.source.value.endsWith('configuration/routes')
        ));
    const hasInvalidImports = invalidImports.size() > 0;
    invalidImports
        .remove();

    // If no tg-named-routes import && has calls
    if (hasCorrectImports && missingCorrectImport && hasCalls) {
        let hasImport = false;
        const importSpecficiers = root
            .find(j.ImportDeclaration)
            .filter(path => path.value.source.value === source)
            .find(j.ImportSpecifier)

        importSpecficiers
            .forEach(path => {
                console.log(path.value.local?.name);
                if (!hasImport) {
                    hasImport = path.value.local?.name === importName;
                }
            });

        if (!hasImport) {
            importSpecficiers.insertAfter(specifier);
        }
    } else if (hasInvalidImports && !hasCorrectImports && hasCalls) {
        const imports = root.find(j.ImportDeclaration);
        const totalImports = imports.size();

        const newDeclaration = j.importDeclaration(
            [specifier],
            j.stringLiteral(source),
            'value'
        )

        if (totalImports) {
            imports.at(-1).paths()[0].insertAfter(newDeclaration);
        } else {
            root.get().node.program.body.unshift(newDeclaration);
        }
    }

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    return root.toSource({ quote: 'single' });
};

module.exports = transform;
