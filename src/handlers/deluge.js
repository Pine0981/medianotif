const { sendDiscord, COLORS, formatBytes, timestamp } = require('../discord');

/**
 * Deluge doesn't have native webhooks — this handler works with the
 * "Execute" plugin in Deluge, which runs a script on torrent events.
 * The companion script (scripts/deluge-notify.sh) POSTs to this endpoint.
 *
 * Expected body:
 * {
 *   event:   "torrent_added" | "torrent_complete" | "torrent_removed",
 *   name:    "Some.Torrent.Name",
 *   hash:    "abc123...",
 *   size:    1234567890,   (bytes, optional)
 *   label:   "sonarr",    (optional — set by label plugin)
 *   save_path: "/downloads/complete"
 * }
 */
module.exports = function delugeHandler(body) {
  const event  = body.event;
  if (!event) return;

  const name   = body.name     || 'Unknown Torrent';
  const hash   = body.hash     ? `\`${body.hash.slice(0, 8)}...\`` : null;
  const label  = body.label    || null;
  const size   = body.size     ? formatBytes(Number(body.size)) : null;
  const path   = body.save_path || null;
  const footer = { text: `Deluge  •  ${timestamp()}` };

  const fields = [];
  if (label)    fields.push({ name: '🏷️ Label',     value: label,              inline: true });
  if (size)     fields.push({ name: '💾 Size',      value: size,               inline: true });
  if (hash)     fields.push({ name: '🔑 Hash',      value: hash,               inline: true });
  if (path)     fields.push({ name: '📁 Save Path', value: `\`${path}\``,      inline: false });

  let embed;

  switch (event) {
    case 'torrent_added':
      embed = {
        title:       '📥 Torrent Added',
        description: `**${name}**`,
        color:       COLORS.grab,
        fields,
        footer,
      };
      break;

    case 'torrent_complete':
      embed = {
        title:       '✅ Torrent Complete',
        description: `**${name}**`,
        color:       COLORS.download,
        fields,
        footer,
      };
      break;

    case 'torrent_removed':
      embed = {
        title:       '🗑️ Torrent Removed',
        description: `**${name}**`,
        color:       COLORS.delete,
        fields,
        footer,
      };
      break;

    default:
      embed = {
        title:       `⚡ Deluge: ${event}`,
        description: `**${name}**`,
        color:       COLORS.info,
        fields,
        footer,
      };
  }

  sendDiscord(embed).catch(e => console.error('[deluge]', e.message));
};
