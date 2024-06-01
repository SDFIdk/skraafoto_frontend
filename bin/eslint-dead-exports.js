import path from 'node:path'

const importCounts = new Map()

const countImports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Count how many times a module export is imported in other files',
      category: 'Best Practices',
      recommended: false
    },
    schema: [] // no options
  },
  create(context) {
    const filePath = context.getFilename();

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        if (importSource.startsWith('.')) {
          const resolvedImportSource = path.resolve(path.dirname(filePath), importSource);
          importCounts.set(resolvedImportSource, (importCounts.get(resolvedImportSource) || 0) + 1);
        }
      },
      'Program:exit'(node) {
        // Check if this file exports something and report if it does
        const exports = node.body.filter(statement => statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration');

        if (exports.length > 0) {
          const resolvedFilePath = path.resolve(filePath);
          const count = importCounts.get(resolvedFilePath) || 0;
          if (count < 1) {
            context.report({
              node: exports[0],
              message: `This module is imported ${count} times in other files.`
            })
          }
        }
      }
    }
  }
}

export default {
  rules: {
    'count-imports': countImports
  }
}