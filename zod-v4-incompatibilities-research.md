# Zod v4 Incompatibilities and Breaking Changes Research

## Overview

Zod v4 represents a major version upgrade from v3 with significant breaking changes focused on performance improvements, API simplification, and enhanced TypeScript support. This document outlines all the major incompatibilities and breaking changes that occur when upgrading from Zod v3 to v4.

## Performance Improvements

While not breaking changes per se, these improvements come with behavioral changes:

- **14x faster string parsing**
- **7x faster array parsing** 
- **6.5x faster object parsing**
- **100x reduction in TypeScript compilation instantiations**
- **2x reduction in core bundle size**

## Major Breaking Changes

### 1. Error Customization API Changes

**Most impactful breaking changes** - Zod v4 completely overhauls error customization:

#### `message` parameter deprecated
```typescript
// Zod v3
z.string().min(5, { message: "Too short." });

// Zod v4 (message still works but deprecated)
z.string().min(5, { error: "Too short." });
```

#### `invalid_type_error` and `required_error` removed
```typescript
// Zod v3
z.string({ 
  required_error: "This field is required",
  invalid_type_error: "Not a string"
});

// Zod v4 - unified error function
z.string({ 
  error: (issue) => issue.input === undefined 
    ? "This field is required" 
    : "Not a string" 
});
```

#### `errorMap` renamed to `error`
```typescript
// Zod v3
z.string().min(5, {
  errorMap: (issue, ctx) => {
    if (issue.code === "too_small") {
      return { message: `Value must be >${issue.minimum}` };
    }
    return { message: ctx.defaultError };
  }
});

// Zod v4 - simplified error function
z.string().min(5, {
  error: (issue) => {
    if (issue.code === "too_small") {
      return `Value must be >${issue.minimum}`;
    }
  }
});
```

#### Error map precedence changed
```typescript
const mySchema = z.string({ error: () => "Schema-level error" });

// Zod v3: contextual error takes precedence
mySchema.parse(12, { error: () => "Contextual error" }); // => "Contextual error"

// Zod v4: schema-level error takes precedence  
mySchema.parse(12, { error: () => "Contextual error" }); // => "Schema-level error"
```

### 2. ZodError Changes

#### Issue format updates
Major restructuring of error issue types:

```typescript
// Zod v3 issue codes that were renamed/merged/removed:
z.ZodIssueCode.invalid_string      // → invalid_format
z.ZodIssueCode.invalid_enum_value  // → invalid_value
z.ZodInvalidEnumValueIssue         // → merged into $ZodIssueInvalidValue
z.ZodInvalidLiteralIssue          // → merged into $ZodIssueInvalidValue
z.ZodInvalidDateIssue             // → merged into invalid_type
z.ZodNotFiniteIssue               // → removed (invalid_type)
```

#### Deprecated ZodError methods
```typescript
// Zod v3
error.format();    // deprecated → use z.treeifyError()
error.flatten();   // deprecated → use z.treeifyError()
error.formErrors;  // removed (was identical to flatten)
error.addIssue();  // deprecated → push to err.issues array
```

### 3. `z.record()` Breaking Changes

#### Single argument usage removed
```typescript
// Zod v3
z.record(z.string()); // ✅ worked

// Zod v4  
z.record(z.string());          // ❌ no longer supported
z.record(z.string(), z.string()); // ✅ required
```

#### Enum support improved but different
```typescript
// Zod v3 - resulted in partial type
const myRecord = z.record(z.enum(["a", "b", "c"]), z.number()); 
// Type: { a?: number; b?: number; c?: number; }

// Zod v4 - ensures exhaustiveness
const myRecord = z.record(z.enum(["a", "b", "c"]), z.number());
// Type: { a: number; b: number; c: number; }

// To get old behavior, use z.partialRecord()
const myRecord = z.partialRecord(z.enum(["a", "b", "c"]), z.number());
// Type: { a?: number; b?: number; c?: number; }
```

### 4. `z.number()` Changes

#### Infinite values no longer accepted
```typescript
// Zod v3
z.number().parse(Infinity);  // ✅ worked
z.number().parse(-Infinity); // ✅ worked

// Zod v4
z.number().parse(Infinity);  // ❌ throws error
z.number().parse(-Infinity); // ❌ throws error
```

#### `.safe()` behavior changed
```typescript
// Zod v3
z.number().safe(); // accepted floats

// Zod v4  
z.number().safe(); // now identical to .int() - integers only
```

#### `.int()` only accepts safe integers
```typescript
// Zod v3
z.number().int().parse(Number.MAX_SAFE_INTEGER + 1); // ✅ worked

// Zod v4
z.number().int().parse(Number.MAX_SAFE_INTEGER + 1); // ❌ throws error
```

### 5. String Format Changes

#### String methods moved to top-level
```typescript
// Zod v3
z.string().email();
z.string().uuid();
z.string().url();

// Zod v4 - methods deprecated, use top-level
z.email();    // ✅ preferred
z.uuid();     // ✅ preferred  
z.url();      // ✅ preferred
```

#### IP validation changes
```typescript
// Zod v3
z.string().ip();    // accepted both IPv4 and IPv6
z.string().cidr();  // accepted both CIDR v4 and v6

// Zod v4
z.string().ip();    // ❌ removed
z.ipv4();          // ✅ IPv4 only
z.ipv6();          // ✅ IPv6 only
z.union([z.ipv4(), z.ipv6()]); // for both

z.string().cidr();  // ❌ removed
z.cidrv4();        // ✅ CIDR v4 only
z.cidrv6();        // ✅ CIDR v6 only
```

#### UUID validation stricter
```typescript
// Zod v4 - stricter RFC compliance
z.uuid(); // RFC 9562/4122 compliant UUID only
z.guid(); // any 8-4-4-4-12 hex pattern (more permissive)
```

### 6. `z.object()` Changes

#### Deprecated methods
```typescript
// Zod v3
z.object({ name: z.string() }).strict();
z.object({ name: z.string() }).passthrough();

// Zod v4 - methods deprecated, use top-level
z.strictObject({ name: z.string() });
z.looseObject({ name: z.string() });
```

#### Removed methods
```typescript
// Zod v3
z.object({}).nonstrict();   // ❌ removed in v4
z.object({}).deepPartial(); // ❌ removed in v4
z.object({}).strip();       // deprecated (was default behavior)
```

#### `.merge()` deprecated
```typescript
// Zod v3
const ExtendedSchema = BaseSchema.merge(AdditionalSchema);

// Zod v4 - .merge() deprecated, use .extend()
const ExtendedSchema = BaseSchema.extend(AdditionalSchema.shape);

// Or destructuring (best performance)
const ExtendedSchema = z.object({
  ...BaseSchema.shape,
  ...AdditionalSchema.shape,
});
```

#### `z.unknown()` optionality changed
```typescript
const mySchema = z.object({
  a: z.any(),
  b: z.unknown()
});

// Zod v3: { a?: any; b?: unknown };
// Zod v4: { a: any; b: unknown };
```

### 7. `z.coerce` Changes

#### Input type changed
```typescript
const schema = z.coerce.string();
type schemaInput = z.input<typeof schema>;

// Zod v3: string
// Zod v4: unknown
```

### 8. `.default()` Behavior Changes

#### Default value application changed
```typescript
// Zod v3 - default applied to input type
const schema = z.string()
  .transform(val => val.length)
  .default("tuna");  // string default
schema.parse(undefined); // => 4

// Zod v4 - default applied to output type
const schema = z.string()
  .transform(val => val.length)
  .default(0);  // number default
schema.parse(undefined); // => 0

// To get old behavior, use .prefault()
const schema = z.string()
  .transform(val => val.length)
  .prefault("tuna");
schema.parse(undefined); // => 4
```

### 9. `z.array()` Changes

#### `.nonempty()` type changed
```typescript
const NonEmpty = z.array(z.string()).nonempty();

// Zod v3: [string, ...string[]]
// Zod v4: string[]

// For old behavior, use z.tuple()
z.tuple([z.string()], z.string()); // => [string, ...string[]]
```

### 10. `z.function()` Complete Overhaul

#### API completely changed
```typescript
// Zod v3
const myFunction = z.function()
  .args(z.object({ name: z.string(), age: z.number() }))
  .returns(z.string());

// Zod v4 - completely different API
const myFunction = z.function({
  input: [z.object({
    name: z.string(),
    age: z.number().int(),
  })],
  output: z.string(),
});

myFunction.implement((input) => {
  return `Hello ${input.name}, you are ${input.age} years old.`;
});
```

### 11. Refinement Changes

#### `.refine()` type predicates ignored
```typescript
const mySchema = z.unknown().refine((val): val is string => {
  return typeof val === "string";
});

// Zod v3: inferred type was `string`
// Zod v4: inferred type is still `unknown`
```

#### `ctx.path` removed
```typescript
// Zod v3
z.string().superRefine((val, ctx) => {
  ctx.path; // ✅ available
});

// Zod v4
z.string().superRefine((val, ctx) => {
  ctx.path; // ❌ no longer available
});
```

#### `.superRefine()` deprecated
```typescript
// Zod v3
z.string().superRefine((val, ctx) => { /* ... */ });

// Zod v4 - use .check() instead
z.string().check((ctx) => { /* ... */ });
```

### 12. Other Breaking Changes

#### `z.nativeEnum()` deprecated
```typescript
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
}

// Zod v3
const ColorSchema = z.nativeEnum(Color);

// Zod v4 - use regular z.enum()
const ColorSchema = z.enum(Color);
```

#### `z.promise()` deprecated
```typescript
// Zod v3
z.promise(z.string());

// Zod v4 - just await before parsing
// Generally not needed anymore
```

#### Convenience methods removed
```typescript
// Zod v3
z.ostring();  // ❌ removed
z.onumber();  // ❌ removed
// Other undocumented convenience methods
```

#### `z.literal()` symbol support removed
```typescript
// Zod v3
z.literal(Symbol("test")); // ✅ worked

// Zod v4
z.literal(Symbol("test")); // ❌ no longer supported
```

#### Static `.create()` factories removed
```typescript
// Zod v3
z.ZodString.create(); // ✅ worked

// Zod v4
z.ZodString.create(); // ❌ removed
```

### 13. Internal Changes (Affecting Library Authors)

#### Generic structure changes
```typescript
// Zod v3
class ZodType<Output, Def extends z.ZodTypeDef, Input = Output> {
  // ...
}

// Zod v4
class ZodType<Output = unknown, Input = unknown> {
  // ...
}
```

#### `._def` moved to `._zod.def`
```typescript
// Zod v3
schema._def; // ✅ available

// Zod v4
schema._zod.def; // ✅ new location
```

## Migration Strategy

### 1. Update Error Handling
- Replace `invalid_type_error` and `required_error` with unified `error` function
- Update `errorMap` to `error` and return strings instead of `{message: string}`
- Remove `errorMap` parameter from `.parse()` calls

### 2. Fix `z.record()` Usage
- Add second parameter for all `z.record()` calls
- Consider using `z.partialRecord()` if you need optional keys

### 3. Update String Formats
- Move to top-level format functions (`z.email()` instead of `z.string().email()`)
- Split IP validation into separate IPv4/IPv6 validators

### 4. Handle Number Changes
- Remove infinite value parsing
- Update `.safe()` usage if you need float support
- Check integer bounds for `.int()` usage

### 5. Update Object Schemas
- Replace deprecated methods with top-level alternatives
- Update `.merge()` to `.extend()`
- Check `z.unknown()` optionality assumptions

### 6. Fix Function Schemas
- Completely rewrite `z.function()` usage with new API
- Use `implementAsync()` for async functions

### 7. Update Refinements
- Replace `.superRefine()` with `.check()`
- Remove `ctx.path` usage
- Update type predicate expectations

## Performance Benefits

The breaking changes enable significant performance improvements:

- **Parsing speed**: 6-14x faster across different schema types
- **TypeScript compilation**: 100x fewer type instantiations
- **Bundle size**: 2-6x smaller depending on usage
- **Memory usage**: Reduced overhead from architectural changes

## New Features Enabled by Breaking Changes

- **Recursive schemas**: Native support without workarounds
- **JSON Schema conversion**: First-party support via `z.toJSONSchema()`
- **Metadata system**: Schema registries and `.meta()` method
- **File validation**: `z.file()` for File instances
- **Template literal types**: `z.templateLiteral()` support
- **Zod Mini**: Functional API variant for smaller bundles
- **Better error formatting**: `z.prettifyError()` function

## Conclusion

While Zod v4 introduces many breaking changes, they enable significant performance improvements and new capabilities. The migration effort is justified by the substantial benefits in speed, bundle size, and developer experience. Most changes follow logical patterns and can be addressed systematically using the strategies outlined above.