import { Help } from '@oclif/core'
import { Topic } from '@oclif/core/lib/interfaces'
import { partition } from 'lodash'

type TopicsArray = (Topic & { subtopics?: { [key: string]: Topic } })[]

export default class DVCHelp extends Help {
    ConfigurationCommands = ['login', 'repo', 'alias', 'generate']

    protected formatTopics(topics: TopicsArray): string {
        if (topics.length === 0) return ''
        const listRenderOptions = {
            spacer: '\n',
            stripAnsi: this.opts.stripAnsi,
            indentation: 2,
        }

        const renderList = (topics: TopicsArray) =>
            this.renderList(
                topics.map((c) => {
                    if (this.config.topicSeparator !== ':') {
                        c.name = c.name.replace(
                            /:/g,
                            this.config.topicSeparator
                        )
                    }
                    return [
                        c.name,
                        c.description &&
                            this.render(c.description.split('\n')[0]),
                    ]
                }),
                listRenderOptions
            )

        const [configurationTopics, featureManagementTopics] = partition(
            topics,
            (topic) => this.ConfigurationCommands.includes(topic.name)
        )
        return this.section(
            'TOPICS',
            this.section('Configuration', renderList(configurationTopics)) + '\n\n' +
            this.section('Feature Management', renderList(featureManagementTopics))
        )
    }
}
