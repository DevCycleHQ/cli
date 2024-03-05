/* eslint-disable max-len */
import { test } from '@oclif/test'
import { AUTH_URL, BASE_URL } from '../src/api/common'

export const dvcTest = () =>
    test
        .nock(AUTH_URL, (api) => {
            api.post('/oauth/token').reply(200, {
                access_token:
                    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlhpTzk1Xzllbk53Z1NNSkZRSXZNUiJ9.eyJodHRwczovL2RldmN5Y2xlLmNvbS9lbWFpbCI6InRlc3RAdGFwbHl0aWNzLmNvbSIsImh0dHBzOi8vZGV2Y3ljbGUuY29tL2lzR2VuZXJpY0RvbWFpbiI6ZmFsc2UsImh0dHBzOi8vZGV2Y3ljbGUuY29tL2FsbG93T3JnRGlzY292ZXJ5Ijp0cnVlLCJpc3MiOiJodHRwczovL2F1dGguZGV2Y3ljbGUuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTExNTU5MDA2NTYzMzMzMzM0MjE0IiwiYXVkIjoiaHR0cHM6Ly9hcGkuZGV2Y3ljbGUuY29tLyIsImlhdCI6MTY4Nzk2NjU0MiwiZXhwIjo5OTk5OTk5OTk5LCJhenAiOiJFdjlKMERHeFIzS2hyS2Fad1k2amxjY21qbDdKR0tFWCIsIm9yZ19pZCI6Im9yZ19VOUY4WU1hVENoVEVuZFd3IiwicGVybWlzc2lvbnMiOlsiY3JlYXRlOnJlc291cmNlcyIsImRlbGV0ZTpyZXNvdXJjZXMiLCJyZWFkOmN1cnJlbnRfb3JnYW5pemF0aW9uIiwicmVhZDpyZXNvdXJjZXMiLCJyZWFkOnVzZXJzIiwidXBkYXRlOnJlc291cmNlcyJdfQ==.bd8rLSYh6ZtnzEgG-Mya86wnOuZcRC97tb4_8gdjTgH2aUCkNRDKcJvLkFL_wYszBurFs75n-BdHKnv9H8yy23fdQbPxX-5Wjq1vvS5PN3DdpvGtc5EuumFBxgwUO3WTmId2znjbMBWIVOM5bViRN8Pba4X6XZSSQ6hxd7-30Txj_5dOsPNikZHjBDuTCqlQxdrZu_ER0JKKkRwdlR8h7qsGMBrTeVqBhIFQXQIFns440FZsCGaOK4hFw9vg6remaBu3HTQRWClXHVwh03lwFTX8MTfwRwFDGhl988zbzK38AAncoKcXKCMrG2GXVswar0RaQWhLSL9eLuX0PI99Ww',
            })
        })
        .nock(BASE_URL, (api) => {
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
            ])
        })
