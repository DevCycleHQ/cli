import {Command} from '@oclif/core'
export default class Diff extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        file: import('@oclif/core/lib/interfaces').OptionFlag<string | undefined>;
    };

    static args: {
        name: string;
        description: string;
    }[];

    run(): Promise<void>;
}
