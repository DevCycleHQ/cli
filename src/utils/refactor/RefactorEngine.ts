import fs from 'fs'
import * as recast from 'recast'
import estraverse from 'estraverse'
import { Literal, Expression, Identifier, ObjectExpression, Property } from 'estree'
import { Variable } from '../../commands/cleanup/types'

export type EngineOptions = {
    output?: 'console' | 'file'
    aliases?: Set<string>
}

type DVCLiteral = Literal & { createdByDvc: true }
type DVCObject = ObjectExpression & { createdByDvc: true }
type VariableAssignments = Record<string, DVCLiteral | DVCObject>

export class RefactorEngine {
    private ast
    private filepath: string
    private output: EngineOptions['output']
    private changed: boolean
    public variable: Variable
    public aliases: Set<string>
    public sdkMethod = 'variable'

    constructor(filepath: string, variable: Variable, options?: EngineOptions) {
        this.filepath = filepath
        this.variable = variable
        this.aliases = options?.aliases || new Set()
        this.output = options?.output || 'file'
        this.ast = recast.parse(fs.readFileSync(filepath, 'utf-8')).program
    }

    static literal(value: any): DVCLiteral {
        return {
            type: 'Literal',
            value: value,
            raw: String(value),
            createdByDvc: true
        }
    }

    static identifier(name: string): Identifier {
        return {
            type: 'Identifier',
            name
        }
    }

    static property(key: string, value: any): Property {
        return {
            type: 'Property',
            key: RefactorEngine.identifier(key),
            value: RefactorEngine.literal(value),
            computed: false,
            kind: 'init',
            method: false,
            shorthand: false
        }
    }

    static dvcVariableObject(variable: Variable): DVCObject {
        let value = variable.value
        if (variable.type === 'String') {
            value = `"${variable.value}"`
        } else if (variable.type === 'Boolean') {
            value = variable.value === 'false' ? false : true
        } else if (variable.type === 'Number') {
            value = Number(variable.value)
        }

        return {
            type: 'ObjectExpression',
            properties: [
                RefactorEngine.property('key', `"${variable.key}"`),
                RefactorEngine.property('value', value),
                RefactorEngine.property('defaultValue', value),
                RefactorEngine.property('isDefaulted', true)
            ],
            createdByDvc: true
        }
    }

    static isDVCLiteral(node: any): boolean {
        return node.type === 'Literal' && node.createdByDvc
    }

    static isDVCObject(node: any): boolean {
        return node.type === 'ObjectExpression' && node.createdByDvc
    }

    static reduceLogicalExpression(
        literal: DVCLiteral, expression: Expression, operator: string
    ): DVCLiteral | Expression | void {
        if (operator === '&&') {
            if (literal.value === true) {
                return expression
            }

            if (literal.value === false) {
                return RefactorEngine.literal(false)
            }
        } else if (operator === '||') {
            if (literal.value === true) {
                return RefactorEngine.literal(true)
            }

            if (literal.value === false) {
                return expression
            }
        }
    }

    static reduceBinaryExpression(
        literal: DVCLiteral, expression: Expression, operator: string
    ): DVCLiteral | void {
        if (expression.type !== 'Literal') return
        if (operator === '==') {
            return RefactorEngine.literal(literal.value == expression.value)
        } else if (operator === '===') {
            return RefactorEngine.literal(literal.value === expression.value)
        }
    }

    /**
     * Replace any DVC SDK variable methods with a static object
     */
    private replaceFeatureFlags = () => {
        const isKeyOrAlias = (arg: any) => {
            const isKey = arg.type === 'Literal' && arg.value === this.variable.key
            const isAlias = arg.type === 'Identifier' && this.aliases.has(arg.name)
            return isKey || isAlias
        }
        const isSdkMethod = (node: any) => (
            node.type === 'CallExpression' &&
            node.callee.type === 'MemberExpression' &&
            node.callee.property.type === 'Identifier' &&
            node.callee.property.name === this.sdkMethod &&
            node.arguments.find(isKeyOrAlias)
        )
    
        const engine = this
        estraverse.replace(this.ast, {
            enter: function(node) {
                if (isSdkMethod(node)) {
                    engine.changed = true
                    return RefactorEngine.dvcVariableObject(engine.variable)
                }
            }
        })
    
    }

    /**
     * Replace DVC variable objects with indexed value, if applicable
     * ex. `{ value: 'foo' }.value` would be replaced with `'foo'`
     */
    private reduceObjects = () => {
        const engine = this
        estraverse.replace(this.ast, {
            enter: function(node) {
                if (
                    node.type === 'MemberExpression' &&
                    RefactorEngine.isDVCObject(node.object)
                ) {
                    const propertyName = (node.property as Identifier).name
                    const object = node.object as DVCObject
                    const objectProperties = object.properties as Property[]
                    const valueLiteral = objectProperties.find((prop) => (
                        prop.key as Identifier).name === propertyName
                    )?.value
                    if (valueLiteral) {
                        engine.changed = true
                        return valueLiteral
                    }
                }
            }
        })
    }

    private evaluateBooleanExpressions = () => {
        const engine = this
        estraverse.replace(this.ast, {
            leave: function(node) {
                let updatedNode
                if (node.type === 'LogicalExpression') {
                    const expression1 = node.left
                    const expression2 = node.right

                    if (RefactorEngine.isDVCLiteral(expression1)) {
                        updatedNode = RefactorEngine
                            .reduceLogicalExpression(expression1 as DVCLiteral, expression2, node.operator)
                    } else if (RefactorEngine.isDVCLiteral(expression2)) {
                        updatedNode = RefactorEngine
                            .reduceLogicalExpression(expression2 as DVCLiteral, expression1, node.operator)
                    }
                } else if (node.type === 'BinaryExpression') {
                    const expression1 = node.left
                    const expression2 = node.right

                    if (RefactorEngine.isDVCLiteral(expression1)) {
                        updatedNode = RefactorEngine
                            .reduceBinaryExpression(expression1 as DVCLiteral, expression2, node.operator)
                    } else if (RefactorEngine.isDVCLiteral(expression2)) {
                        updatedNode = RefactorEngine
                            .reduceBinaryExpression(expression2 as DVCLiteral, expression1, node.operator)
                    }
                } else if (
                    node.type === 'UnaryExpression' &&
                    node.operator === '!' &&
                    RefactorEngine.isDVCLiteral(node.argument)
                ) {
                    const argument = node.argument as DVCLiteral
                    if (argument.value === true) {
                        updatedNode = RefactorEngine.literal(false)
                    } else if (argument.value === false) {
                        updatedNode = RefactorEngine.literal(true)
                    }
                }

                if (updatedNode) {
                    engine.changed = true
                    return updatedNode
                }
            },
            fallback: 'iteration',
        })
    }

    /**
     * Reduce if statements that are always true/false
     */
    private reduceIfStatements() {
        const engine = this
        estraverse.replace(this.ast, {
            leave: function(node) {
                if (
                    (node.type === 'IfStatement' || node.type === 'ConditionalExpression') &&
                    RefactorEngine.isDVCLiteral(node.test)
                ) {
                    const nodeTest = node.test as DVCLiteral
                    engine.changed = true
                    if (nodeTest.value) {
                        return node.consequent
                    } else if (node.alternate == null) {
                        this.remove()
                    } else {
                        return node.alternate
                    }
                }
            },
            fallback: 'iteration',
        })

        // Flatten any nested blocks introduced in the previous step by moving their contents to their parent
        estraverse.traverse(this.ast, {
            leave: function(node, parent) {
                if (
                    node.type === 'BlockStatement' &&
                    (parent?.type === 'BlockStatement' || parent?.type === 'Program')
                ) {
                    const nodeIndex = parent.body.indexOf(node)
                    parent.body.splice(nodeIndex, 1, ...node.body)
                }
            },
        })
    }

    /**
     * Build a map of variables assigned to a DVC boolean literal or variable object
     */
    private getRedundantVarMap() {
        const assignments: VariableAssignments = {}

        estraverse.traverse(this.ast, {
            enter: function(node) {
                if (node.type === 'VariableDeclaration') {
                    node.declarations.forEach((declaration) => {
                        if (declaration.init) {
                            const declarationId = declaration.id as Identifier
                            if (RefactorEngine.isDVCLiteral(declaration.init)) {
                                const declarationInit = declaration.init as DVCLiteral
                                if (typeof declarationInit.value === 'boolean') {
                                    assignments[declarationId.name] = declarationInit
                                }
                            } else if (RefactorEngine.isDVCObject(declaration.init)) {
                                const declarationInit = declaration.init as DVCObject
                                assignments[declarationId.name] = declarationInit
                            }
                        }
                    })
                } else if (node.type === 'AssignmentExpression') {
                    if (node.right && RefactorEngine.isDVCLiteral(node.right)) {
                        const nodeRight = node.right as DVCLiteral
                        const nodeLeft = node.left as Identifier
                        if (
                            typeof nodeRight.value === 'boolean' &&
                            nodeLeft.name !== undefined
                        ) {
                            assignments[nodeLeft.name] = nodeRight
                        }
                    } else if (node.right && RefactorEngine.isDVCObject(node.right)) {
                        const nodeRight = node.right as DVCObject
                        const nodeLeft = node.left as Identifier
                        if (nodeLeft.name !== undefined) {
                            assignments[nodeLeft.name] = nodeRight
                        }
                    }
                }
            },
            fallback: 'iteration',
        })

        return assignments
    }

    /**
     * Remove redundant variables by deleting declarations and replacing variable references
     */
    private pruneVarReferences(assignments: VariableAssignments) {
        const engine = this
        estraverse.replace(this.ast, {
            enter: function(node, parent) {
                if (node.type === 'VariableDeclarator') {
                    const nodeId = node.id as Identifier
                    if (nodeId.name in assignments) {
                        engine.changed = true
                        return this.remove()
                    }
                } else if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression') {
                    const expressionLeft = node.expression.left as Identifier
                    if (expressionLeft.name in assignments) {
                        engine.changed = true
                        return this.remove()
                    }
                } else if (node.type === 'Identifier' && parent?.type !== 'Property') {
                    if (node.name in assignments) {
                        engine.changed = true
                        return assignments[node.name]
                    }
                }
            },

            // After previous step, some declaration may have no declarators, delete them.
            leave: function(node) {
                if (node.type === 'VariableDeclaration') {
                    if (node.declarations.length === 0) {
                        engine.changed = true
                        return this.remove()
                    }
                }
            },

            fallback: 'iteration',
        })
    }
    
    public refactor = (): void => {
        this.changed = true
        let iterations = 0

        while (this.changed && iterations < 10) {
            this.changed = false
            iterations++

            this.replaceFeatureFlags()
            this.reduceObjects()
            this.evaluateBooleanExpressions()
            this.reduceIfStatements()
            const varAssignments = this.getRedundantVarMap()
            this.pruneVarReferences(varAssignments)
        }

        const { code } = recast.print(this.ast)
        if (this.output === 'console') {
            console.log(code)
        } else {
            fs.writeFileSync(this.filepath, code)
        }
    }
}