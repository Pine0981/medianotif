const { sendDiscord, COLORS, timestamp } = require('../discord');

// Overseerr sends a "notification_type" string like "MEDIA_PENDING", "MEDIA_APPROVED", etc.
const NOTIFICATION_TYPES = {
  MEDIA_PENDING:          { title: '🕐 New Request Pending',       color: COLORS.warning  },
  MEDIA_APPROVED:         { title: '✅ Request Approved',           color: COLORS.success  },
  MEDIA_DECLINED:         { title: '❌ Request Declined',           color: COLORS.error    },
  MEDIA_AVAILABLE:        { title: '🎉 Media Now Available!',       color: COLORS.download },
  MEDIA_FAILED:           { title: '💥 Request Failed',             color: COLORS.error    },
  MEDIA_AUTO_APPROVED:    { title: '⚡ Auto-Approved Request',      color: COLORS.success  },
  TEST_NOTIFICATION:      { title: '🧪 Overseerr — Connection Test', color: COLORS.info    },
  ISSUE_CREATED:          { title: '🐛 New Issue Reported',         color: COLORS.warning  },
  ISSUE_COMMENT:          { title: '💬 Issue Comment Added',        color: COLORS.info     },
  ISSUE_RESOLVED:         { title: '✅ Issue Resolved',             color: COLORS.success  },
  ISSUE_REOPENED:         { title: '🔁 Issue Reopened',             color: COLORS.warning  },
};

module.exports = function overseerrHandler(body) {
  const type   = body.notification_type || body.notificationType;
  const footer = { text: `Overseerr  •  ${timestamp()}` };

  if (!type) return;

  const meta   = NOTIFICATION_TYPES[type] || { title: `📋 Overseerr: ${type}`, color: COLORS.info };
  const media  = body.media;
  const req    = body.request;
  const issue  = body.issue;

  const fields = [];

  // Media info
  if (media) {
    fields.push({
      name:   '📽️ Title',
      value:  media.media_type === 'tv'
                ? `${body.subject || 'Unknown'}`
                : `${body.subject || 'Unknown'}`,
      inline: false,
    });
    if (media.media_type) {
      fields.push({ name: '🎭 Type', value: media.media_type === 'tv' ? 'TV Show' : 'Movie', inline: true });
    }
    if (media.status) {
      fields.push({ name: '📊 Status', value: humanStatus(media.status), inline: true });
    }
  }

  // Requester info
  if (req?.requestedBy) {
    const user = req.requestedBy;
    fields.push({
      name:   '👤 Requested By',
      value:  user.displayName || user.email || 'Unknown',
      inline: true,
    });
  }

  // Issue info
  if (issue) {
    fields.push({
      name:   '🐛 Issue Type',
      value:  issue.issueType || 'Unknown',
      inline: true,
    });
    if (body.comment?.message) {
      fields.push({
        name:   '💬 Comment',
        value:  body.comment.message.slice(0, 200),
        inline: false,
      });
    }
  }

  // Extra message from Overseerr
  if (body.message && type !== 'TEST_NOTIFICATION') {
    fields.push({ name: '📝 Message', value: body.message.slice(0, 500), inline: false });
  }

  const embed = {
    title:  meta.title,
    color:  meta.color,
    fields,
    footer,
  };

  // Add poster if available
  if (media?.posterPath) {
    embed.thumbnail = { url: `https://image.tmdb.org/t/p/w200${media.posterPath}` };
  }

  if (type === 'TEST_NOTIFICATION') {
    embed.description = 'medianotify is connected and receiving Overseerr webhooks!';
  }

  sendDiscord(embed).catch(e => console.error('[overseerr]', e.message));
};

function humanStatus(status) {
  const map = {
    1: 'Unknown',
    2: 'Pending',
    3: 'Processing',
    4: 'Partially Available',
    5: 'Available',
  };
  return map[status] || String(status);
}
