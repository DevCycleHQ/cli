import { Command, Flags } from '@oclif/core';
import { fetchFeatures } from '../../api/features';
import { fetchConfigurationByFeatureKey, FeatureConfiguration, Target } from '../../api/featureConfigurations';
import Base from '../base';

export default class StaleFlags extends Base {
  static hidden = false;
  static flags = {
    ...Base.flags,
    'days': Flags.integer({
      char: 'd',
      description: 'Days since last update to consider a feature stale.',
      default: 30,
    }),
    'stale-types': Flags.string({
      char: 't',
      description: 'Comma-separated list of stale types to check.',
      default: 'inactive,long-running',
    }),
  };
  authRequired = true;

  public async run(): Promise<void> {
    const { flags } = await this.parse(StaleFlags);
    const staleTypes = flags['stale-types']?.split(',') || ['inactive', 'long-running'];
    const days = flags['days'];
  
    await this.requireProject();
  
    let features = await fetchFeatures(this.token, this.projectKey);
  
    const currentTime = new Date().getTime();
  
    const staleReasonsMap = new Map();
  
    for (const feature of features) {
        console.log("Testing feature: "+feature.name)
      const daysSinceLastUpdate =
        (currentTime - new Date(feature.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      const configurations = await fetchConfigurationByFeatureKey(this.token, this.projectKey, feature.key);
  
      const reasons: string[] = [];
  
      if (
        staleTypes.includes('inactive') &&
        configurations.every((config: FeatureConfiguration) => config.status === 'inactive') &&
        daysSinceLastUpdate > days
      ) {
        reasons.push('inactive');
      }
  
      if (
        staleTypes.includes('long-running') &&
        daysSinceLastUpdate > days &&
        configurations.every(
          (config: FeatureConfiguration) =>
            config.targets.every((target: Target) =>
              target.distribution.every((dist) => dist.percentage === 100)
            )
        )
      ) {
        reasons.push('long-running');
      }

  
      if (reasons.length > 0) {
        staleReasonsMap.set(feature, reasons);
      }
    }
  
    // Print stale features
    let index = 1;
    staleReasonsMap.forEach((reasons, feature) => {
      console.log(`${index}.`);
      console.log(`Feature: ${feature.key}`);
      console.log(`Stale Reasons: ${reasons.join(', ')}`);
      console.log('');
      index++;
    });
  }
}
