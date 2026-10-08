import { describe, expect, test } from 'vitest'
import axios from 'axios'
import { axiosClient } from '../../src/api/apiClient'
import './axiosFetchDefaults'

describe('axiosFetchDefaults', () => {
    test('sets a Workers-compatible cache mode on global axios defaults', () => {
        expect(axios.defaults.fetchOptions?.cache).toBe('no-store')
    })

    test('sets a Workers-compatible cache mode on the shared axiosClient', () => {
        expect(axiosClient.defaults.fetchOptions?.cache).toBe('no-store')
    })
})
