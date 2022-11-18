import { Node, ExpressionStatement, MemberExpression, CallExpression } from 'estree'

export const isMemberExpression = (node: Node): node is MemberExpression => (
    ['MemberExpression', 'OptionalMemberExpression'].includes(node?.type)
)

export const getCallExpression = (node: ExpressionStatement): CallExpression | null => {
    if (node.expression.type === 'CallExpression') return node.expression
    if (node.expression.type === 'AwaitExpression' && node.expression.argument.type === 'CallExpression') {
        return node.expression.argument
    }
    return null
}