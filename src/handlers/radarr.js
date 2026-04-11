const { sendDiscord, COLORS, formatBytes, timestamp } = require('../discord');

module.exports = function radarrHandler(body) {
  const event  = body.eventType;
  if (!event) return;

  const movie  = body.movie?.title || 'Unknown Movie';
  const year   = body.movie?.year  ? ` (${body.movie.year})` : '';
  const footer = { text: `Radarr  •  ${timestamp()}` };
  let embed;

  switch (event) {
    case 'Test':
      embed = {
        title: '🧪 Radarr — Connection Test',
        description: 'medianotify is connected and receiving Radarr webhooks!',
        color: COLORS.success,
        footer,
      };
      break;

    case 'Grab':
      embed = {
        title: '📥 Grabbing Movie',
        description: `**${movie}${year}**`,
        color: COLORS.grab,
        fields: [
          { name: '📦 Quality',  value: body.release?.quality      || 'Unknown', inline: true },
          { name: '🔍 Indexer',  value: body.release?.indexer      || 'Unknown', inline: true },
          { name: '📄 Release',  value: body.release?.releaseTitle || 'Unknown', inline: false },
        ],
        footer,
      };
      if (body.remoteMovie?.images?.[0]?.url) {
        embed.thumbnail = { url: body.remoteMovie.images[0].url };
      }
      break;

    case 'Download':
      embed = {
        title: body.isUpgrade ? '⬆️ Movie Upgraded' : '✅ Movie Downloaded',
        description: `**${movie}${year}**`,
        color: body.isUpgrade ? COLORS.upgrade : COLORS.download,
        fields: [
          { name: '📦 Quality', value: body.movieFile?.quality           || 'Unknown', inline: true },
          { name: '💾 Size',    value: formatBytes(body.movieFile?.size),               inline: true },
        ],
        footer,
      };
      if (body.movie?.images?.[0]?.remoteUrl) {
        embed.thumbnail = { url: body.movie.images[0].remoteUrl };
      }
      break;

    case 'MovieFileDelete':
      embed = {
        title: '🗑️ Movie File Deleted',
        description: `**${movie}${year}**`,
        color: COLORS.delete,
        fields: [
          { name: '📋 Reason', value: body.deleteReason || 'Unknown', inline: true },
        ],
        footer,
      };
      break;

    case 'MovieDelete':
      embed = {
        title: '💀 Movie Deleted',
        description: `**${movie}${year}** has been removed`,
        color: COLORS.delete,
        fields: [
          { name: '🗂️ Files Deleted', value: String(body.deletedFiles ?? 'Unknown'), inline: true },
        ],
        footer,
      };
      break;

    case 'MovieAdded':
      embed = {
        title: '➕ Movie Added',
        description: `**${movie}${year}**`,
        color: COLORS.info,
        footer,
      };
      if (body.movie?.images?.[0]?.remoteUrl) {
        embed.thumbnail = { url: body.movie.images[0].remoteUrl };
      }
      break;

    case 'Rename':
      embed = {
        title: '✏️ Movie Renamed',
        description: `**${movie}** files have been renamed`,
        color: COLORS.info,
        footer,
      };
      break;

    case 'Health':
      embed = {
        title: '🏥 Radarr Health Issue',
        description: body.message || 'An issue was detected',
        color: COLORS.warning,
        fields: [{ name: '🔖 Type', value: body.type || 'Unknown', inline: true }],
        footer,
      };
      break;

    case 'HealthRestored':
      embed = {
        title: '💚 Radarr Health Restored',
        description: body.message || 'Issue has been resolved',
        color: COLORS.success,
        footer,
      };
      break;

    case 'ApplicationUpdate':
      embed = {
        title: '🔄 Radarr Updated',
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
        title: `🎬 Radarr: ${event}`,
        description: 'An event was received from Radarr',
        color: COLORS.info,
        footer,
      };
  }

  sendDiscord(embed).catch(e => console.error('[radarr]', e.message));
};
