# 🎬 medianotify

> Lightweight Discord notification microservice for your self-hosted media stack.

Receive rich Discord notifications for **Sonarr**, **Radarr**, **Overseerr**, and **Deluge** — all from a single tiny container (~50MB).

![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
![Node](https://img.shields.io/badge/node-20--alpine-green?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📣 Notification Events

| App | Events |
|---|---|
| **Sonarr** | Grab, Download, Upgrade, Series Add/Delete, File Delete, Rename, Health Issue/Restored, App Update |
| **Radarr** | Grab, Download, Upgrade, Movie Add/Delete, File Delete, Rename, Health Issue/Restored, App Update |
| **Overseerr** | Request Pending/Approved/Declined/Available/Failed, Issues, Comments |
| **Deluge** | Torrent Added, Complete, Removed (via Execute plugin + companion script) |

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Pine0981/medianotify.git
cd medianotify
```

### 2. Configure environment

```bash
cp .env.example .env
nano .env
```

Set your `DISCORD_WEBHOOK_URL`. Everything else is optional.

### 3. Run with Docker Compose

```bash
docker compose up -d
```

That's it. medianotify is now listening on port **5055**.

---

## ⚙️ Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_WEBHOOK_URL` | ✅ Yes | — | Your Discord webhook URL |
| `AUTH_TOKEN` | No | _(disabled)_ | Secret token for endpoint auth |
| `PORT` | No | `5055` | Port to listen on |

### Getting a Discord Webhook URL

1. Open your Discord server
2. Go to **Server Settings → Integrations → Webhooks**
3. Click **New Webhook**, choose a channel, copy the URL

---

## 🔗 Webhook URLs

| App | URL |
|---|---|
| Sonarr | `http://medianotify:5055/webhook/sonarr` |
| Radarr | `http://medianotify:5055/webhook/radarr` |
| Overseerr | `http://medianotify:5055/webhook/overseerr` |
| Deluge | `http://medianotify:5055/webhook/deluge` |

> If running on the same Docker network as your media stack, use the container name `medianotify` as the hostname. Otherwise use your server's IP.

---

## 📡 App Setup

### Sonarr & Radarr

1. Go to **Settings → Connect → + → Webhook**
2. Set the URL to `http://medianotify:5055/webhook/sonarr` (or radarr)
3. Check all the events you want
4. If you set `AUTH_TOKEN`, add a header: `x-auth-token: your-token`
5. Click **Test** — you'll get a test notification in Discord

### Overseerr

1. Go to **Settings → Notifications → Webhook**
2. Enable it and set the Webhook URL to `http://medianotify:5055/webhook/overseerr`
3. Check all notification types
4. Click **Test Notification**

### Deluge (Execute Plugin)

Deluge doesn't have built-in webhooks, so we use the **Execute** plugin with a companion shell script.

**Step 1** — Enable the Execute plugin in Deluge's plugin manager

**Step 2** — Copy the script to your Deluge host:

```bash
cp scripts/deluge-notify.sh /opt/deluge-notify.sh
chmod +x /opt/deluge-notify.sh
```

**Step 3** — Edit the script and set your medianotify URL:

```bash
MEDIANOTIFY_URL="http://YOUR_SERVER_IP:5055"
```

**Step 4** — In Deluge's Execute plugin, add these commands:

| Event | Command |
|---|---|
| Torrent Added | `/opt/deluge-notify.sh torrent_added %T %N %S` |
| Torrent Complete | `/opt/deluge-notify.sh torrent_complete %T %N %S` |
| Torrent Removed | `/opt/deluge-notify.sh torrent_removed %T %N %S` |

> `%T` = hash, `%N` = name, `%S` = save path

---

## 🐳 Docker Compose (full media stack example)

```yaml
services:
  medianotify:
    image: medianotify:latest
    build: .
    container_name: medianotify
    restart: unless-stopped
    ports:
      - "5055:5055"
    environment:
      - DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
      - AUTH_TOKEN=your-secret-token
    networks:
      - media

networks:
  media:
    external: true
```

---

## 🏥 Health Check

```bash
curl http://localhost:5055/health
# {"status":"ok","uptime":"42s","timestamp":"..."}
```

---

## 🛠 Development

```bash
npm install
cp .env.example .env  # fill in your webhook URL
npm run dev           # runs with --watch for auto-reload
```

---

## 📦 Building the Image

```bash
docker build -t medianotify .
```

The final image is based on **node:20-alpine** and is under 50MB.

---

## 📄 License

MIT — do whatever you want with it.
