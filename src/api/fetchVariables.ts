import axios from 'axios'
import {BASE_URL} from './common'

export const fetchVariableKeys = async (token: string, project_id: string): Promise<string[]> => {
  const url = new URL(`/v1/projects/${project_id}/variables`, BASE_URL)
  const response = await axios.get(url.href, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  })

  return response.data.map((variable: any) => variable.key)
}
