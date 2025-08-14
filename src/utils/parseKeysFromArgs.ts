/**
 * Parse keys from command arguments with proper precedence handling
 * Supports positional arguments, named args, and flags with comma/space separation
 */
export function parseKeysFromArgs(
    args: { keys?: string },
    argv: unknown[],
    flags: { keys?: string },
): string[] | undefined {
    // Handle positional arguments - they take precedence over --keys flag
    if (argv && argv.length > 0) {
        // Collect all positional arguments and split any comma-separated values
        return argv.flatMap((arg) => String(arg).split(','))
    }

    if (args.keys) {
        // Handle the first positional argument if provided
        return args.keys.split(',')
    }

    if (flags.keys) {
        // Fall back to --keys flag
        return flags.keys.split(',')
    }

    return undefined
}
