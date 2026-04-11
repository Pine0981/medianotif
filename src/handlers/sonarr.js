const { sendDiscord, COLORS, formatBytes, timestamp } = require('../discord');

function epStr(ep) {
  if (!ep) return null;
  return `S${String(ep.seasonNumber).padStart(2, '0')}E${String(ep.episodeNumber).padStart(2, '0')} — ${ep.title}`;
}

module.exports = function sonarrHandler(body) {
  const event = body.eventType;
  if (!event) return;

  const series = body.series?.title || 'Unknown Show';
  const ep     = body.episodes?.[0];
  const footer = { text: `Sonarr  •  ${timestamp()}` };
  let embed;

  switch (event) {
    case 'Test':
      embed = {
        title: '🧪 Sonarr — Connection Test',
        description: 'medianotify is connected and receiving Sonarr webhooks!',
        color: COLORS.success,
        footer,
      };
      break;

    case 'Grab':
      embed = {
        title: '📥 Grabbing Episode',
        description: `**${series}**${ep ? `\n${epStr(ep)}` : ''}`,
        color: COLORS.grab,
        fields: [
          { name: '📦 Quality',  value: body.release?.quality       || 'Unknown', inline: true },
          { name: '🔍 Indexer',  value: body.release?.indexer       || 'Unknown', inline: true },
          { name: '📄 Release',  value: body.release?.releaseTitle  || 'Unknown', inline: false },
        ],
        footer,
      };
      break;

    case 'Download':
      embed = {
        title: body.isUpgrade ? '⬆️ Episode Upgraded' : '✅ Episode Downloaded',
        description: `**${series}**${ep ? `\n${epStr(ep)}` : ''}`,
        color: body.isUpgrade ? COLORS.upgrade : COLORS.download,
        fields: [
          { name: '📦 Quality', value: body.episodeFile?.quality           || 'Unknown', inline: true },
          { name: '💾 Size',    value: formatBytes(body.episodeFile?.size),               inline: true },
        ],
        footer,
      };
      if (body.series?.images?.[0]?.remoteUrl) {
        embed.thumbnail = { url: body.series.images[0].remoteUrl };
      }
      break;

    case 'EpisodeFileDelete':
      embed = {
        title: '🗑️ Episode File Deleted',
        description: `**${series}**${ep ? `\n${epStr(ep)}` : ''}`,
        color: COLORS.delete,
        fields: [
          { name: '📋 Reason', value: body.deleteReason || 'Unknown', inline: true },
        ],
        footer,
      };
      break;

    case 'SeriesAdd':
      embed = {
        title: '➕ Series Added',
        description: `**${series}** (${body.series?.year || '?'})`,
        color: COLORS.info,
        fields: [
          { name: '📡 Network', value: body.series?.network || 'Unknown', inline: true },
          { name: '📊 Status',  value: body.series?.status  || 'Unknown', inline: true },
        ],
        footer,
      };
      if (body.series?.images?.[0]?.remoteUrl) {
        embed.thumbnail = { url: body.series.images[0].remoteUrl };
      }
      break;

    case 'SeriesDelete':
      embed = {
        title: '💀 Series Deleted',
        description: `**${series}** has been removed`,
        color: COLORS.delete,
        fields: [
          { name: '🗂️ Files Deleted', value: body.deleteReason || 'Unknown', inline: true },
        ],
        footer,
      };
      break;

    case 'Rename':
      embed = {
        title: '✏️ Series Renamed',
        description: `**${series}** files have been renamed`,
        color: COLORS.info,
        footer,
      };
      break;

    case 'Health':
      embed = {
        title: '🏥 Sonarr Health Issue',
        description: body.message || 'An issue was detected',
        color: COLORS.warning,
        fields: [
          { name: '🔖 Type', value: body.type || 'Unknown', inline: true },
        ],
        footer,
      };
      break;

    case 'HealthRestored':
      embed = {
        title: '💚 Sonarr Health Restored',
        description: body.message || 'Issue has been resolved',
        color: COLORS.success,
        footer,
      };
      break;

    case 'ApplicationUpdate':
      embed = {
        title: '🔄 Sonarr Updated',
        description: `Updated to **${body.newVersion || 'new version'}**`,
        color: COLORS.info,
        fields: body.previousVersion
          ? [{ name: 'Previous Version', value: body.previousVersion, inline: true }]
          : [],
        footer,
      };
      break;

    default:
      embed = {
        title: `📺 Sonarr: ${event}`,
        description: 'An event was received from Sonarr',
        color: COLORS.info,
        footer,
      };
  }

  sendDiscord(embed).catch(e => console.error('[sonarr]', e.message));
};
