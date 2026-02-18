import { spawn } from 'child_process';
import { platform } from 'os';
import { formatTime } from '../utils/time.js';

export function ringBell(): void {
  process.stdout.write('\x07');
}

export async function sendDesktopNotification(title: string, body: string): Promise<void> {
  const p = platform();
  try {
    if (p === 'darwin') {
      // Banner notification
      await exec('osascript', [
        '-e',
        `display notification "${escapeAppleScript(body)}" with title "${escapeAppleScript(title)}"`,
      ]);
      // Play sound directly — bypasses notification settings that often mute alerts
      await exec('afplay', ['/System/Library/Sounds/Glass.aiff']);
      // Modal fallback — banner often hidden by notification settings; modal always shows
      const t = escapeAppleScript(title);
      const b = escapeAppleScript(body);
      await exec('osascript', [
        '-e',
        `tell application "System Events" to display dialog ("${t}" & return & return & "${b}") with title "tost" buttons {"OK"} default button "OK"`,
      ]);
    } else if (p === 'win32') {
      const ps = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
        $template = @"
        <toast><visual><binding template="ToastText02"><text id="1">${escapePowerShell(title)}</text><text id="2">${escapePowerShell(body)}</text></binding></visual></toast>
"@
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($template)
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("tost-cli")
        $notifier.Show($toast)
      `;
      await exec('powershell', ['-Command', ps]);
    } else if (p === 'linux') {
      await exec('notify-send', [title, body]);
    }
  } catch {
    // Fail silently if unsupported
  }
}

function escapeAppleScript(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapePowerShell(s: string): string {
  return s.replace(/'/g, "''").replace(/`/g, '``');
}

function exec(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'ignore',
      shell: platform() === 'win32' && cmd === 'powershell',
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Exit ${code}`));
    });
    child.on('error', reject);
  });
}
