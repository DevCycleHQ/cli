import axios from 'axios'
import { axiosClient } from '../../src/api/apiClient'

/**
 * axios >= 1.20 defaults fetch requests to `cache: 'default'`, which the
 * Workers runtime rejects ("Unsupported cache mode: default"). Workers only
 * accept `no-store` / `no-cache`, so set an explicit value on both the global
 * axios defaults and the shared CLI client instance.
 */
const fetchOptions = { cache: 'no-store' as const }

axios.defaults.fetchOptions = fetchOptions
axiosClient.defaults.fetchOptions = fetchOptions
