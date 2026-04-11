const https = require('https');
const url = require('url');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendDiscord(embed) {
  if (!WEBHOOK_URL) {
    console.warn('[discord] DISCORD_WEBHOOK_URL not set — skipping');
    return;
  }

  const payload = JSON.stringify({ embeds: [embed] });
  const parsed = url.parse(WEBHOOK_URL);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.resume();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[discord] Sent (${res.statusCode})`);
          resolve();
        } else {
          reject(new Error(`Discord returned ${res.statusCode}`));
        }
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const COLORS = {
  success:  0x2ecc71,
  error:    0xe74c3c,
  info:     0x3498db,
  grab:     0x9b59b6,
  upgrade:  0xe67e22,
  download: 0x27ae60,
  request:  0x1abc9c,
  warning:  0xf39c12,
  delete:   0xe74c3c,
};

function formatBytes(bytes) {
  if (!bytes) return 'Unknown';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

function timestamp() {
  return new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

module.exports = { sendDiscord, COLORS, formatBytes, timestamp };
