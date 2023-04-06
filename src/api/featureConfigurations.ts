
import axios from 'axios'
import { BASE_URL } from './common'
export interface FeatureConfiguration {
    _feature: string;
    _environment: string;
    _createdBy: string;
    status: 'active' | 'inactive';
    startedAt: string;
    updatedAt: string;
    targets: {
      _id: string;
      name: string;
      audience: {
        name: string;
        filters: {
          filters: { type: string }[];
          operator: 'and' | 'or';
        };
      };
      rollout?: {
        startPercentage: number;
        type: string;
        startDate: string;
        stages: {
          percentage: number;
          type: string;
          date: string;
        }[];
      };
      distribution: {
        percentage: number;
        _variation: string;
      }[];
    }[];
    readonly: boolean;
  }

  export const fetchConfigurationByFeatureKey = async (
    token: string,
    projectKey: string,
    featureKey: string
  ): Promise<FeatureConfiguration[]> => {
    const url = new URL(`/v1/projects/${projectKey}/features/${featureKey}/configurations`, BASE_URL);
    const response = await axios.get(url.href, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
  
    return response.data;
  };

  export interface FeatureConfiguration {
    _feature: string;
    _environment: string;
    _createdBy: string;
    status: 'active' | 'inactive';
    startedAt: string;
    updatedAt: string;
    targets: Target[];
    readonly: boolean;
  }  

  export interface Target {
    _id: string;
    name: string;
    audience: {
      name: string;
      filters: {
        filters: { type: string }[];
        operator: 'and' | 'or';
      };
    };
    rollout?: {
      startPercentage: number;
      type: string;
      startDate: string;
      stages: {
        percentage: number;
        type: string;
        date: string;
      }[];
    };
    distribution: {
      percentage: number;
      _variation: string;
    }[];
  }