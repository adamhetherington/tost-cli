# tost

**t**ask **o**riented **s**ession **t**imer — a minimal focus timer for the terminal.

## Philosophy

tost is intentionally minimal and calm. It does **not** track tasks, lists, streaks, productivity stats, or history. It is a quiet, terminal-native focus timer. No gamification.

## Installation

```bash
npm install -g tost-cli
```

Or use it via `npx`:

```bash
npx tost-cli 25
```

## Usage

```bash
tost <minutes>          # Start a focus session
tost break <minutes>    # Start a break session
tost config             # Show config path and current config
tost config set <key> <value>   # Update config (e.g. alerts.bell false)
tost config reset       # Delete config (wizard runs next time)
```

### Examples

```bash
tost 25                 # 25-minute focus session
tost 1                  # 1-minute focus (handy for testing)
tost break 5            # 5-minute break
tost --no-bell 25       # Focus without terminal bell
tost --notify 30        # Explicitly enable desktop notification
tost --quiet 60         # Minimal output, no bar, no alerts
```

## Flags

| Flag | Description |
|------|-------------|
| `--quiet` | Minimal output. Disables progress bar and all alerts. |
| `--no-bar` | Disable progress bar for this run only. |
| `--no-bell` | Disable terminal bell for this run. |
| `--no-notify` | Disable desktop notification for this run. |
| `--notify` | Explicitly enable desktop notification. |

CLI flags override config for that run only.

## Config

Config is stored as JSON:

- **Windows:** `%APPDATA%/tost/config.json`
- **macOS:** `~/Library/Application Support/tost/config.json`
- **Linux:** `~/.config/tost/config.json`

Schema:

```json
{
  "progressBar": true,
  "alerts": {
    "bell": true,
    "notify": true
  },
  "tickMs": 250
}
```

On first run (when stdout is a TTY), a wizard guides you through initial setup.

## Non-TTY

When stdout is not a TTY (e.g. piped, background), tost:

- Does not show the progress bar
- Does not run interactive prompts
- Uses safe defaults
- Still allows completion alerts unless `--quiet` is used

## Publishing

```bash
npm version patch
npm publish --access public
```

## Author

Adam Hetherington

## License

MIT
