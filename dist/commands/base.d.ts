import {Command} from '@oclif/core'
export default abstract class Base extends Command {
    static flags: {
        client_id: import('@oclif/core/lib/interfaces').OptionFlag<string>;
        client_secret: import('@oclif/core/lib/interfaces').OptionFlag<string>;
        project: import('@oclif/core/lib/interfaces').OptionFlag<string>;
    };

    token: string | null;
    init(): Promise<void>;
}
