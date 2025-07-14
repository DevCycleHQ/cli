"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockFeatures = exports.dvcTest = void 0;
/* eslint-disable max-len */
const test_1 = require("@oclif/test");
const common_1 = require("../src/api/common");
const dvcTest = () => test_1.test
    .nock(common_1.AUTH_URL, (api) => {
    api.post('/oauth/token').reply(200, {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlhpTzk1Xzllbk53Z1NNSkZRSXZNUiJ9.eyJodHRwczovL2RldmN5Y2xlLmNvbS9lbWFpbCI6InRlc3RAdGFwbHl0aWNzLmNvbSIsImh0dHBzOi8vZGV2Y3ljbGUuY29tL2lzR2VuZXJpY0RvbWFpbiI6ZmFsc2UsImh0dHBzOi8vZGV2Y3ljbGUuY29tL2FsbG93T3JnRGlzY292ZXJ5Ijp0cnVlLCJpc3MiOiJodHRwczovL2F1dGguZGV2Y3ljbGUuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTExNTU5MDA2NTYzMzMzMzM0MjE0IiwiYXVkIjoiaHR0cHM6Ly9hcGkuZGV2Y3ljbGUuY29tLyIsImlhdCI6MTY4Nzk2NjU0MiwiZXhwIjo5OTk5OTk5OTk5LCJhenAiOiJFdjlKMERHeFIzS2hyS2Fad1k2amxjY21qbDdKR0tFWCIsIm9yZ19pZCI6Im9yZ19VOUY4WU1hVENoVEVuZFd3IiwicGVybWlzc2lvbnMiOlsiY3JlYXRlOnJlc291cmNlcyIsImRlbGV0ZTpyZXNvdXJjZXMiLCJyZWFkOmN1cnJlbnRfb3JnYW5pemF0aW9uIiwicmVhZDpyZXNvdXJjZXMiLCJyZWFkOnVzZXJzIiwidXBkYXRlOnJlc291cmNlcyJdfQ==.bd8rLSYh6ZtnzEgG-Mya86wnOuZcRC97tb4_8gdjTgH2aUCkNRDKcJvLkFL_wYszBurFs75n-BdHKnv9H8yy23fdQbPxX-5Wjq1vvS5PN3DdpvGtc5EuumFBxgwUO3WTmId2znjbMBWIVOM5bViRN8Pba4X6XZSSQ6hxd7-30Txj_5dOsPNikZHjBDuTCqlQxdrZu_ER0JKKkRwdlR8h7qsGMBrTeVqBhIFQXQIFns440FZsCGaOK4hFw9vg6remaBu3HTQRWClXHVwh03lwFTX8MTfwRwFDGhl988zbzK38AAncoKcXKCMrG2GXVswar0RaQWhLSL9eLuX0PI99Ww',
    });
})
    .nock(common_1.BASE_URL, (api) => {
    api.get('/v1/projects').reply(200, [
        {
            key: 'project',
            settings: {
                obfuscation: {},
            },
        },
        {
            key: 'test-project',
        },
    ]);
});
exports.dvcTest = dvcTest;
exports.mockFeatures = [
    {
        key: 'feature-1',
        name: 'Feature 1',
        _id: '61450f3daec96f5cf4a49946',
        _project: 'test-project',
        source: 'api',
        _createdBy: 'test-user',
        createdAt: '2021-09-15T12:00:00Z',
        updatedAt: '2021-09-15T12:00:00Z',
        variations: [],
        variables: [],
        tags: [],
        configurations: [],
        sdkVisibility: {
            mobile: true,
            client: true,
            server: true,
        },
        settings: {},
        readonly: false,
        controlVariation: 'control',
    },
    {
        key: 'feature-2',
        name: 'Feature 2',
        _id: '61450f3daec96f5cf4a49947',
        _project: 'test-project',
        source: 'api',
        _createdBy: 'test-user',
        createdAt: '2021-09-15T12:00:00Z',
        updatedAt: '2021-09-15T12:00:00Z',
        variations: [],
        variables: [],
        tags: [],
        configurations: [],
        sdkVisibility: {
            mobile: true,
            client: true,
            server: true,
        },
        settings: {},
        readonly: false,
        controlVariation: 'control',
    },
    {
        key: 'feature-with-optin',
        name: 'feature with optIn',
        _id: '68220a9dbc3cb4d3d14ba7bf',
        _project: '6819062b8affcfbc2be4d4d5',
        source: 'dashboard',
        status: 'active',
        type: 'release',
        description: 'description',
        _createdBy: 'google-oauth2|112025847388655732143',
        createdAt: '2025-05-12T14:50:05.620Z',
        updatedAt: '2025-05-21T15:06:50.696Z',
        variations: [
            {
                _id: '68220a9dbc3cb4d3d14ba7d4',
                key: 'variation-base',
                name: 'Base Variation',
                variables: {
                    'togglebot-speed': 'off',
                    'example-text': 'step-1',
                    'togglebot-wink': false,
                },
            },
            {
                _id: '68220a9dbc3cb4d3d14ba7d5',
                key: 'variation-spin',
                name: 'Spin Variation',
                variables: {
                    'togglebot-speed': 'slow',
                    'example-text': 'step-2',
                    'togglebot-wink': true,
                },
            },
        ],
        controlVariation: 'variation-base',
        variables: [
            {
                _id: '68220a9dbc3cb4d3d14ba7c5',
                _project: '6819062b8affcfbc2be4d4d5',
                _feature: '68220a9dbc3cb4d3d14ba7bf',
                name: 'Togglebot Spin Speed',
                key: 'togglebot-speed',
                type: 'String',
                status: 'active',
                source: 'dashboard',
                _createdBy: 'google-oauth2|112025847388655732143',
                createdAt: '2025-05-12T14:50:05.635Z',
                updatedAt: '2025-05-12T14:50:05.635Z',
            },
            {
                _id: '68220a9dbc3cb4d3d14ba7c6',
                _project: '6819062b8affcfbc2be4d4d5',
                _feature: '68220a9dbc3cb4d3d14ba7bf',
                name: 'Togglebot Wink Enabled',
                key: 'togglebot-wink',
                type: 'Boolean',
                status: 'active',
                source: 'dashboard',
                _createdBy: 'google-oauth2|112025847388655732143',
                createdAt: '2025-05-12T14:50:05.635Z',
                updatedAt: '2025-05-12T14:50:05.635Z',
            },
            {
                _id: '68220a9dbc3cb4d3d14ba7c7',
                _project: '6819062b8affcfbc2be4d4d5',
                _feature: '68220a9dbc3cb4d3d14ba7bf',
                name: 'Example App Display Text',
                key: 'example-text',
                type: 'String',
                status: 'active',
                source: 'dashboard',
                _createdBy: 'google-oauth2|112025847388655732143',
                createdAt: '2025-05-12T14:50:05.635Z',
                updatedAt: '2025-05-12T14:50:05.635Z',
            },
        ],
        tags: [],
        readonly: false,
        settings: {
            optInEnabled: true,
            publicName: 'public feature name',
            publicDescription: 'public feature description',
        },
        sdkVisibility: {
            mobile: true,
            client: true,
            server: true,
        },
        configurations: [
            {
                _feature: '68220a9dbc3cb4d3d14ba7bf',
                _environment: '6819062b8affcfbc2be4d4d8',
                _createdBy: 'google-oauth2|112025847388655732143',
                status: 'active',
                startedAt: '2025-05-12T14:50:05.815Z',
                updatedAt: '2025-05-21T15:04:01.135Z',
                targets: [
                    {
                        _id: '682380cf606a1643f8bd01e3',
                        name: 'Opt-In Users',
                        audience: {
                            name: 'Opt-In Users',
                            filters: {
                                operator: 'and',
                                filters: [
                                    {
                                        type: 'optIn',
                                    },
                                ],
                            },
                        },
                        distribution: [
                            {
                                _variation: '68220a9dbc3cb4d3d14ba7d4',
                                percentage: 1,
                            },
                        ],
                    },
                ],
                readonly: false,
            },
        ],
    },
];
//# sourceMappingURL=dvcTest.js.map