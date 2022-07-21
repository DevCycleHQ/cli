import { expect, test } from '@oclif/test'

const expectedTrue = `console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: true,
    defaultValue: true,
    isDefaulted: true
})

const someVar = dvcClient.variable(user, "some-var", "stringy")
const templateVar = \`Hello, \${someVar}\`
const concatVar = "Goodbye, " + someVar
// Simple Case is true
console.log('obj var .value is truthy')

const x = 1

console.log('obj.value === true')
console.log('obj.value is truthy')

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)
`

const expectedFalse = `console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: false,
    defaultValue: false,
    isDefaulted: true
})

const x = 0

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)
`

const expectedNumber = `const simpleCaseValue = 3

console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: 3,
    defaultValue: 3,
    isDefaulted: true
})

if (simpleCaseValue === true) {
    const someVar = dvcClient.variable(user, "some-var", "stringy")
    const templateVar = \`Hello, \${someVar}\`
    const concatVar = "Goodbye, " + someVar
}

// Simple Case is true
console.log('obj var .value is truthy')

if (simpleCaseValue === 3) {
    console.log('value var === 3')
}

const x = simpleCaseValue ? 1 : 0

console.log('obj.value is truthy')

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)
`

const expectedString = `const simpleCaseValue = "My String"

console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: "My String",
    defaultValue: "My String",
    isDefaulted: true
})

if (simpleCaseValue === true) {
    const someVar = dvcClient.variable(user, "some-var", "stringy")
    const templateVar = \`Hello, \${someVar}\`
    const concatVar = "Goodbye, " + someVar
}

// Simple Case is true
console.log('obj var .value is truthy')

if (simpleCaseValue === 3) {
    console.log('value var === 3')
}

const x = simpleCaseValue ? 1 : 0

console.log('obj.value is truthy')

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)
`

const expectedJSON = `const simpleCaseValue = { "foo": "bar" }

console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: { "foo": "bar" },
    defaultValue: { "foo": "bar" },
    isDefaulted: true
})

if (simpleCaseValue === true) {
    const someVar = dvcClient.variable(user, "some-var", "stringy")
    const templateVar = \`Hello, \${someVar}\`
    const concatVar = "Goodbye, " + someVar
}

// Simple Case is true
console.log('obj var .value is truthy')

if (simpleCaseValue === 3) {
    console.log('value var === 3')
}

const x = simpleCaseValue ? 1 : 0

console.log('obj.value is truthy')

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)
`

const expectedAlias = `console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: false,
    defaultValue: false,
    isDefaulted: true
})

const x = 0

console.log(false)
`

describe('cleanup', () => {
    test
        .stdout()
        .command([
            'cleanup', 'simple-case',
            '--value', 'true',
            '--type', 'Boolean',
            '--include', 'test/commands/fixtures/cleanup/nodejs/test.js',
            '--output', 'console'
        ])
        .it('refactors correctly when value=true', (ctx) => {
            expect(ctx.stdout).to.equal(expectedTrue)
        })

    test
        .stdout()
        .command([
            'cleanup', 'simple-case',
            '--value', 'false',
            '--type', 'Boolean',
            '--include', 'test/commands/fixtures/cleanup/nodejs/test.js',
            '--output', 'console'
        ])
        .it('refactors correctly when value=false', (ctx) => {
            expect(ctx.stdout).to.equal(expectedFalse)
        })

    test
        .stdout()
        .command([
            'cleanup', 'simple-case',
            '--value', '3',
            '--type', 'Number',
            '--include', 'test/commands/fixtures/cleanup/nodejs/test.js',
            '--output', 'console'
        ])
        .it('refactors correctly when value is a number', (ctx) => {
            expect(ctx.stdout).to.equal(expectedNumber)
        })

    test
        .stdout()
        .command([
            'cleanup', 'simple-case',
            '--value', 'My String',
            '--type', 'String',
            '--include', 'test/commands/fixtures/cleanup/nodejs/test.js',
            '--output', 'console'
        ])
        .it('refactors correctly when value is a string', (ctx) => {
            expect(ctx.stdout).to.equal(expectedString)
        })

    test
        .stdout()
        .command([
            'cleanup', 'simple-case',
            '--value', '{ "foo": "bar" }',
            '--type', 'JSON',
            '--include', 'test/commands/fixtures/cleanup/nodejs/test.js',
            '--output', 'console'
        ])
        .it('refactors correctly when value is JSON', (ctx) => {
            expect(ctx.stdout).to.equal(expectedJSON)
        })

    test
        .stdout()
        .command([
            'cleanup', 'simple-case',
            '--value', 'false',
            '--type', 'Boolean',
            '--include', 'test/commands/fixtures/cleanup/nodejs/test.js',
            '--var-alias', 'SIMPLE_CASE=simple-case',
            '--output', 'console'
        ])
        .it('correctly replaces aliases', (ctx) => {
            expect(ctx.stdout).to.equal(expectedAlias)
        })
})
