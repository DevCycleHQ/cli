import { z } from 'zod'
import { schemas } from './zodClient'

export type Project = z.infer<typeof schemas.Project>
export type Environment = z.infer<typeof schemas.Environment>
export type SDKKeys = z.infer<typeof schemas.SDKKeys>
export type Variable = z.infer<typeof schemas.Variable>
export type Variation = z.infer<typeof schemas.Variation>
export type Feature = z.infer<typeof schemas.Feature>
