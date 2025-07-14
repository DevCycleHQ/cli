export declare const dvcTest: () => import("fancy-test/lib/types").Base<{
    nock: number;
} & import("fancy-test/lib/types").Context, {
    skip: {
        output: unknown;
        args: [];
    };
} & {
    only: {
        output: unknown;
        args: [];
    };
} & {
    retries: {
        output: unknown;
        args: [count: number];
    };
} & {
    catch: {
        output: {
            error: Error;
        };
        args: [arg: string | RegExp | ((err: Error) => any), opts?: {
            raiseIfNotThrown?: boolean | undefined;
        } | undefined];
    };
} & {
    env: {
        output: unknown;
        args: [env: {
            [k: string]: string | null | undefined;
        }, opts?: import("fancy-test/lib/types").EnvOptions | undefined];
    };
} & {
    stub: {
        output: {
            stubs: any[];
        };
        args: [object: any, path: any, value: () => any];
    };
} & {
    stdin: {
        output: unknown;
        args: [input: string, delay?: number | undefined];
    };
} & {
    stderr: {
        output: {
            readonly stderr: string;
        };
        args: [opts?: {
            print?: boolean | undefined;
            stripColor?: boolean | undefined;
        } | undefined];
    };
} & {
    stdout: {
        output: {
            readonly stdout: string;
        };
        args: [opts?: {
            print?: boolean | undefined;
            stripColor?: boolean | undefined;
        } | undefined];
    };
} & {
    nock: {
        output: {
            nock: number;
        };
        args: [host: string, options: import("fancy-test/lib/types").NockOptions | import("fancy-test/lib/types").NockCallback, cb?: import("fancy-test/lib/types").NockCallback | undefined];
    };
} & {
    timeout: {
        output: {
            timeout: number;
        };
        args: [timeout?: number | undefined];
    };
} & {
    loadConfig: {
        output: {
            config: import("@oclif/core/lib/interfaces").Config;
        };
        args: [opts?: import("@oclif/test/lib/load-config").loadConfig.Options | undefined];
    };
} & {
    command: {
        output: {
            config: import("@oclif/core/lib/interfaces").Config;
            expectation: string;
            returned: unknown;
        };
        args: [args: string | string[], opts?: import("@oclif/test/lib/load-config").loadConfig.Options | undefined];
    };
} & {
    exit: {
        output: {
            error: any;
        };
        args: [code?: number | undefined];
    };
} & {
    hook: {
        output: {
            config: import("@oclif/core/lib/interfaces").Config;
            expectation: string;
            returned: unknown;
        };
        args: [event: string, hookOpts?: Record<string, unknown> | undefined, options?: import("@oclif/test/lib/load-config").loadConfig.Options | undefined];
    };
}>;
export declare const mockFeatures: ({
    key: string;
    name: string;
    _id: string;
    _project: string;
    source: string;
    _createdBy: string;
    createdAt: string;
    updatedAt: string;
    variations: never[];
    variables: never[];
    tags: never[];
    configurations: never[];
    sdkVisibility: {
        mobile: boolean;
        client: boolean;
        server: boolean;
    };
    settings: {
        optInEnabled?: undefined;
        publicName?: undefined;
        publicDescription?: undefined;
    };
    readonly: boolean;
    controlVariation: string;
    status?: undefined;
    type?: undefined;
    description?: undefined;
} | {
    key: string;
    name: string;
    _id: string;
    _project: string;
    source: string;
    status: string;
    type: string;
    description: string;
    _createdBy: string;
    createdAt: string;
    updatedAt: string;
    variations: {
        _id: string;
        key: string;
        name: string;
        variables: {
            'togglebot-speed': string;
            'example-text': string;
            'togglebot-wink': boolean;
        };
    }[];
    controlVariation: string;
    variables: {
        _id: string;
        _project: string;
        _feature: string;
        name: string;
        key: string;
        type: string;
        status: string;
        source: string;
        _createdBy: string;
        createdAt: string;
        updatedAt: string;
    }[];
    tags: never[];
    readonly: boolean;
    settings: {
        optInEnabled: boolean;
        publicName: string;
        publicDescription: string;
    };
    sdkVisibility: {
        mobile: boolean;
        client: boolean;
        server: boolean;
    };
    configurations: {
        _feature: string;
        _environment: string;
        _createdBy: string;
        status: string;
        startedAt: string;
        updatedAt: string;
        targets: {
            _id: string;
            name: string;
            audience: {
                name: string;
                filters: {
                    operator: string;
                    filters: {
                        type: string;
                    }[];
                };
            };
            distribution: {
                _variation: string;
                percentage: number;
            }[];
        }[];
        readonly: boolean;
    }[];
})[];
//# sourceMappingURL=dvcTest.d.ts.map