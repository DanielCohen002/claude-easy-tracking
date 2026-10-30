import type { Register } from 'claude-code'

const MARK = '▶ '

const NEXT_STEPS = {
  id: 'easy-tracking:next-steps',
  scope: 'session',
  text: [
    '# Marking the user\'s next steps',
    `Whenever the user has to do something themselves (run a command, click something, answer a question, make a choice), write each such action on its own line beginning with "${MARK}" (for example "${MARK}Run the command below, then tell me the code it prints."). The terminal draws these lines highlighted so the user can spot them.`,
    `Put them where the action belongs, usually at the end of the reply. A command to copy goes in a code block right after its "${MARK}" line, not on it. Never use "${MARK}" for anything else, and leave it out when there is nothing for the user to do.`,
  ].join('\n'),
} as const

type Segment = { isStep: boolean; text: string }

// Splits a reply into plain markdown and next-step lines, ignoring the marker inside code fences
function split(text: string): Segment[] {
  const segments: Segment[] = []
  let isFenced = false

  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      isFenced = !isFenced
    }

    const isStep = !isFenced && line.trimStart().startsWith(MARK)
    const last = segments[segments.length - 1]

    if (last && !last.isStep && !isStep) {
      last.text += '\n' + line
    } else {
      segments.push({ isStep, text: isStep ? line.trimStart().slice(MARK.length) : line })
    }
  }

  return segments.filter(s => s.text.trim() !== '')
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const sec = total % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

// A row is drawn more than once, so its clock time is fixed the first time it is seen
const doneAt = new Map<string, string>()

function doneTime(key: string): string {
  let t = doneAt.get(key)
  if (!t) {
    t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    doneAt.set(key, t)
  }
  return t
}

export const register: Register = on => {
  on('prompt.compose', async ($, e, next) => {
    const result = await next(e)

    return { ...result, sections: [...result.sections, NEXT_STEPS] }
  })

  on('ui.render', { component: 'UserMessage', props: { origin: { kind: 'composer' } } }, ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">{MARK}YOU</Text>
        <Text>{e.props.text}</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    const segments = split(e.props.text)

    if (!segments.some(s => s.isStep)) {
      return next(e)
    }

    const { Box, Text, Markdown } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {segments.map((s, i) =>
          s.isStep ? (
            <Box key={`s${i}`} flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1}>
              <Text bold color="yellow">{MARK}YOUR TURN</Text>
              <Markdown text={s.text} />
            </Box>
          ) : (
            <Markdown key={`m${i}`} text={s.text} />
          ),
        )}
      </Box>
    )
  })

  on('ui.render', { component: 'TurnDuration' }, ($, e, next) => {
    if (e.props.waitingFor || e.props.isExpanded) {
      return next(e)
    }

    const { Text } = $.ui.resolve(e)
    const time = doneTime(`${e.props.word}:${e.props.durationMs}`)

    return <Text color="green">✻ {e.props.word} for {formatDuration(e.props.durationMs)} · done {time}</Text>
  })
}
