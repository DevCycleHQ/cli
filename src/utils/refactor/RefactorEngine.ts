import fs from 'fs'
import * as recast from 'recast'
import estraverse from 'estraverse'
import chalk from 'chalk'
import {
    Literal,
    Expression,
    Identifier,
    ObjectExpression,
    Property,
} from 'estree'
import { Variable } from '../../commands/cleanup/types'
import { getCallExpression, isMemberExpression } from './utils'

export type EngineOptions = {
    output?: 'console' | 'file'
    aliases?: Set<string>
}

type DVCLiteral = Literal & { createdByDvc: true }
type DVCObject = ObjectExpression & { createdByDvc: true }
type VariableAssignment = {
    replace: boolean
    value: DVCLiteral | DVCObject
}
type VariableAssignments = Record<string, VariableAssignment>

export abstract class RefactorEngine {
    private ast: any
    private filepath: string
    private output: EngineOptions['output']
    private fileRefactored: boolean
    private changed: boolean
    private varAssignments: VariableAssignments = {}

    public variable: Variable
    public aliases: Set<string>

    abstract sdkMethods: Record<string, string>
    abstract parser: { parse(source: any): any }

    constructor(filepath: string, variable: Variable, options?: EngineOptions) {
        this.filepath = filepath
        this.variable = variable
        this.aliases = options?.aliases || new Set()
        this.output = options?.output || 'file'
    }

    static literal(value: any): DVCLiteral {
        return {
            type: 'Literal',
            value: value,
            raw: String(value),
            createdByDvc: true,
        }
    }

    static identifier(name: string): Identifier {
        return {
            type: 'Identifier',
            name,
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
            shorthand: false,
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
                RefactorEngine.property('isDefaulted', true),
            ],
            createdByDvc: true,
        }
    }

    static isDVCLiteral(node: any): boolean {
        return node.type === 'Literal' && node.createdByDvc
    }

    static isDVCObject(node: any): boolean {
        return node.type === 'ObjectExpression' && node.createdByDvc
    }

    static reduceLogicalExpression(
        literal: DVCLiteral,
        expression: Expression,
        operator: string,
    ): DVCLiteral | Expression | void {
        if (operator === '&&') {
            return literal.value ? expression : RefactorEngine.literal(false)
        } else if (operator === '||') {
            return literal.value ? RefactorEngine.literal(true) : expression
        }
    }

    static reduceBinaryExpression(
        literal: DVCLiteral,
        expression: Expression,
        operator: string,
    ): DVCLiteral | void {
        if (!expression.type.includes('Literal')) return
        const literalExpression = expression as Literal
        if (operator === '==') {
            return RefactorEngine.literal(
                literal.value == literalExpression.value,
            )
        } else if (operator === '===') {
            return RefactorEngine.literal(
                literal.value === literalExpression.value,
            )
        }
    }

    private getAssignmentValueIfSet(expression: Expression) {
        return expression.type === 'Identifier' &&
            expression.name &&
            this.varAssignments[expression.name]
            ? this.varAssignments[expression.name].value
            : expression
    }

    /**
     * Replace any DVC SDK variable methods with a static object
     */
    private replaceFeatureFlags = () => {
        const isKeyOrAlias = (arg: any): boolean => {
            const isKey =
                arg.type.includes('Literal') && arg.value === this.variable.key
            const isAlias =
                arg.type === 'Identifier' && this.aliases.has(arg.name)
            return isKey || isAlias
        }
        const getVariableProperty = (node: any): string | undefined => {
            if (node.type !== 'CallExpression') return undefined

            let identifier
            if (node.callee.type === 'Identifier') {
                identifier = node.callee
            } else if (
                isMemberExpression(node.callee) &&
                node.callee.property.type === 'Identifier'
            ) {
                identifier = node.callee.property
            }

            if (
                identifier &&
                Object.prototype.hasOwnProperty.call(
                    this.sdkMethods,
                    identifier.name,
                ) &&
                node.arguments.find(isKeyOrAlias)
            ) {
                return this.sdkMethods[identifier.name]
            }

            return undefined
        }

        const engine = this
        estraverse.replace(this.ast, {
            enter: function (node) {
                const variableProperty = getVariableProperty(node)
                if (variableProperty) {
                    engine.changed = true
                    if (variableProperty === 'variable') {
                        return RefactorEngine.dvcVariableObject(engine.variable)
                    } else {
                        const [_, property] = variableProperty.split('.')
                        return {
                            type: 'MemberExpression',
                            object: RefactorEngine.dvcVariableObject(
                                engine.variable,
                            ),
                            property: RefactorEngine.identifier(property),
                            computed: false,
                            optional: false,
                        }
                    }
                }
                return node
            },
            fallback: 'iteration',
        })
    }

    /**
     * Replace DVC variable objects with indexed value, if applicable
     * ex. `{ value: 'foo' }.value` would be replaced with `'foo'`
     */
    private reduceObjects = () => {
        const engine = this
        estraverse.replace(this.ast, {
            enter: function (node) {
                // Refactor DVC object properties (ie. key, value, isDefaulted)
                if (
                    isMemberExpression(node) &&
                    RefactorEngine.isDVCObject(node.object)
                ) {
                    const propertyName = (node.property as Identifier).name
                    const object = node.object as DVCObject
                    const objectProperties = object.properties as Property[]
                    const valueLiteral = objectProperties.find(
                        (prop) =>
                            (prop.key as Identifier).name === propertyName,
                    )?.value
                    if (valueLiteral) {
                        engine.changed = true
                        return valueLiteral
                    }
                }
                // Refactor DVC object methods (ie. onUpdate)
                const callExpression =
                    node.type === 'ExpressionStatement' &&
                    getCallExpression(node)
                const memberExpression =
                    callExpression &&
                    isMemberExpression(callExpression.callee) &&
                    callExpression.callee
                if (
                    memberExpression &&
                    RefactorEngine.isDVCObject(memberExpression.object) &&
                    memberExpression.property?.type === 'Identifier' &&
                    memberExpression.property.name === 'onUpdate'
                ) {
                    engine.changed = true
                    return this.remove()
                }
            },
            fallback: 'iteration',
        })
    }

    private evaluateExpressions = () => {
        const engine = this

        estraverse.replace(this.ast, {
            leave: function (node) {
                let updatedNode
                if (node.type === 'LogicalExpression') {
                    const expression1 = engine.getAssignmentValueIfSet(
                        node.left,
                    )
                    const expression2 = engine.getAssignmentValueIfSet(
                        node.right,
                    )

                    if (RefactorEngine.isDVCLiteral(expression1)) {
                        updatedNode = RefactorEngine.reduceLogicalExpression(
                            expression1 as DVCLiteral,
                            expression2,
                            node.operator,
                        )
                    } else if (RefactorEngine.isDVCLiteral(expression2)) {
                        updatedNode = RefactorEngine.reduceLogicalExpression(
                            expression2 as DVCLiteral,
                            expression1,
                            node.operator,
                        )
                    }
                } else if (node.type === 'BinaryExpression') {
                    const expression1 = engine.getAssignmentValueIfSet(
                        node.left,
                    )
                    const expression2 = engine.getAssignmentValueIfSet(
                        node.right,
                    )

                    if (RefactorEngine.isDVCLiteral(expression1)) {
                        updatedNode = RefactorEngine.reduceBinaryExpression(
                            expression1 as DVCLiteral,
                            expression2,
                            node.operator,
                        )
                    } else if (RefactorEngine.isDVCLiteral(expression2)) {
                        updatedNode = RefactorEngine.reduceBinaryExpression(
                            expression2 as DVCLiteral,
                            expression1,
                            node.operator,
                        )
                    }
                } else if (
                    node.type === 'UnaryExpression' &&
                    node.operator === '!'
                ) {
                    const nodeArgument = engine.getAssignmentValueIfSet(
                        node.argument,
                    )

                    if (RefactorEngine.isDVCLiteral(nodeArgument)) {
                        const literalArgument = nodeArgument as DVCLiteral
                        updatedNode = RefactorEngine.literal(
                            !literalArgument.value,
                        )
                    }
                }

                if (updatedNode) {
                    engine.changed = true
                    return updatedNode
                }
                return node
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
            leave: function (node) {
                if (
                    node.type === 'IfStatement' ||
                    node.type === 'ConditionalExpression'
                ) {
                    const nodeTest = engine.getAssignmentValueIfSet(node.test)

                    if (RefactorEngine.isDVCLiteral(nodeTest)) {
                        const nodeTestLiteral = nodeTest as DVCLiteral
                        engine.changed = true
                        if (nodeTestLiteral.value) {
                            return node.consequent
                        } else if (node.alternate == null) {
                            this.remove()
                        } else {
                            return node.alternate
                        }
                    }
                }
                return node
            },
            fallback: 'iteration',
        })

        // Flatten any nested blocks introduced in the previous step by moving their contents to their parent
        estraverse.traverse(this.ast, {
            leave: function (node, parent) {
                if (
                    node.type === 'BlockStatement' &&
                    (parent?.type === 'BlockStatement' ||
                        parent?.type === 'Program')
                ) {
                    const nodeIndex = parent.body.indexOf(node)
                    parent.body.splice(nodeIndex, 1, ...node.body)
                }
            },
            fallback: 'iteration',
        })
    }

    /**
     * Build a map of variables assigned to a DVC literal or variable object
     * Only booleans and variable objects should be replaced,
     * other types will be referenced when evaluating conditionals
     */
    private getVariableMap() {
        const assignments: VariableAssignments = {}

        estraverse.traverse(this.ast, {
            enter: function (node) {
                if (node.type === 'VariableDeclaration') {
                    node.declarations.forEach((declaration) => {
                        if (declaration.init) {
                            const declarationId = declaration.id as Identifier
                            if (RefactorEngine.isDVCLiteral(declaration.init)) {
                                const declarationInit =
                                    declaration.init as DVCLiteral
                                assignments[declarationId.name] = {
                                    replace:
                                        typeof declarationInit.value ===
                                        'boolean',
                                    value: declarationInit,
                                }
                            } else if (
                                RefactorEngine.isDVCObject(declaration.init)
                            ) {
                                const declarationInit =
                                    declaration.init as DVCObject
                                assignments[declarationId.name] = {
                                    replace: true,
                                    value: declarationInit,
                                }
                            }
                        }
                    })
                } else if (node.type === 'AssignmentExpression') {
                    if (node.right && RefactorEngine.isDVCLiteral(node.right)) {
                        const nodeRight = node.right as DVCLiteral
                        const nodeLeft = node.left as Identifier
                        if (nodeLeft.name !== undefined) {
                            assignments[nodeLeft.name] = {
                                replace: typeof nodeRight.value === 'boolean',
                                value: nodeRight,
                            }
                        }
                    } else if (
                        node.right &&
                        RefactorEngine.isDVCObject(node.right)
                    ) {
                        const nodeRight = node.right as DVCObject
                        const nodeLeft = node.left as Identifier
                        if (nodeLeft.name !== undefined) {
                            assignments[nodeLeft.name] = {
                                replace: true,
                                value: nodeRight,
                            }
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
    private pruneVarReferences() {
        const engine = this
        estraverse.replace(this.ast, {
            enter: function (node, parent) {
                // Remove variable declaration if necessary
                let identifier
                if (node.type === 'VariableDeclarator') {
                    identifier = node.id as Identifier
                } else if (
                    node.type === 'ExpressionStatement' &&
                    node.expression.type === 'AssignmentExpression'
                ) {
                    identifier = node.expression.left as Identifier
                }
                if (
                    identifier &&
                    identifier.name in engine.varAssignments &&
                    engine.varAssignments[identifier.name].replace
                ) {
                    engine.changed = true
                    return this.remove()
                }

                // Replace node with variable value if necessary
                if (
                    node.type === 'Identifier' &&
                    parent?.type !== 'Property' &&
                    Object.prototype.hasOwnProperty.call(
                        engine.varAssignments,
                        node.name,
                    ) &&
                    engine.varAssignments[node.name].replace
                ) {
                    engine.changed = true
                    return engine.varAssignments[node.name].value
                }
            },

            // After previous step, some declaration may have no declarators, delete them.
            leave: function (node) {
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

    private parseAST = () => {
        try {
            const parseOptions = this.parser ? { parser: this.parser } : {}
            this.ast = recast.parse(
                fs.readFileSync(this.filepath, 'utf-8'),
                parseOptions,
            ).program
        } catch (err: any) {
            console.warn(chalk.yellow(`Error parsing file ${this.filepath}`))
            console.warn(`\t${err.message}`)
        }
    }

    private printAST = () => {
        try {
            const { code } = recast.print(this.ast)
            if (this.output === 'console') {
                console.error(code)
            } else if (this.fileRefactored) {
                fs.writeFileSync(this.filepath, code)
            }
        } catch (err: any) {
            console.warn(
                chalk.yellow(
                    `Error occurred while recasting file ${this.filepath}`,
                ),
            )
            console.warn(`\t${err.message}`)
        }
    }

    public refactor = (): void => {
        this.parseAST()
        if (!this.ast) return

        this.changed = true
        let iterations = 0

        while (this.changed && iterations < 10) {
            this.changed = false
            iterations++

            this.replaceFeatureFlags()
            this.reduceObjects()
            this.varAssignments = this.getVariableMap()
            this.pruneVarReferences()
            this.evaluateExpressions()
            this.reduceIfStatements()
            if (this.changed) this.fileRefactored = true
        }

        this.printAST()
    }
}
