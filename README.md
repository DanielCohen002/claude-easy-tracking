# easy-tracking

A Claude Code mod that makes a long conversation easier to follow. It draws your own prompts in a cyan **▶ YOU** box in the transcript, and it highlights the next steps Claude asks you to take in a yellow **▶ YOUR TURN** box, so you can spot what is waiting on you at a glance.

Both boxes share the same rounded border, with the label on its own line above the text.

When a turn finishes, the "✻ … for 1m 5s" line is drawn in green with the clock time it finished, such as "· done 3:42 PM", so you can tell at a glance that Claude is done and not still running.

When Claude finishes responding, a short ding plays (the Windows `ding.wav`, through a `Stop` hook). Remove the `hooks` block from `hooks/hooks.json` to turn it off.

Claude is told to start each line that needs your action with a `▶` marker. The mod draws those lines highlighted and leaves the marker alone inside code blocks.

## Install

At the prompt of a terminal session:

```
/plugin install easy-tracking --marketplace DanielCohen002/claude-easy-tracking
```

From a shell:

```
claude plugin install easy-tracking --marketplace DanielCohen002/claude-easy-tracking
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `DanielCohen002/claude-easy-tracking`, then Add plugin.

Answer `y` to add the marketplace, then pick a scope. The mod is active right away.
