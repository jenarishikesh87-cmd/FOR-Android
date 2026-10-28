import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const native = Capacitor.isNativePlatform();
let channelReady = false;
const DAY_MS = 24 * 60 * 60 * 1000;

function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function notificationId(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 2147483000 + 1;
}
function makeNotification(supplement, date, at, snoozed = false) {
  const key = `${date}_${supplement.id}`;
  return {
    id: notificationId(`${key}${snoozed ? ':snooze' : ':dose'}`),
    title: snoozed ? `FOR reminder: ${supplement.name}` : `FOR reminder: ${supplement.name}`,
    body: snoozed
      ? `Snooze finished. ${supplement.dose || 'Your scheduled supplement'} · open FOR to log it.`
      : `${supplement.dose || 'Your scheduled supplement'} · ${supplement.time}. Open FOR to log it.`,
    schedule: { at, allowWhileIdle: true },
    channelId: 'for-reminders',
    smallIcon: 'ic_stat_for',
    iconColor: '#ed1c24',
    extra: { supplementId: supplement.id, date, snoozed },
  };
}

async function ensureChannel() {
  if (channelReady) return;
  try {
    await LocalNotifications.createChannel({
      id: 'for-reminders',
      name: 'FOR reminders',
      description: 'Scheduled supplement reminders from FOR',
      importance: 4,
      visibility: 1,
      vibration: true,
    });
  } catch (_) {
    // iOS and older plugin implementations may not expose Android channels.
  }
  channelReady = true;
}

async function requestPermission() {
  if (!native) return false;
  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return false;
  // Exact alarms are optional at OS level, so gracefully keep using allowed scheduling if unavailable.
  try {
    const exact = await LocalNotifications.checkExactNotificationSetting();
    if (exact && exact.exactAlarm === false) await LocalNotifications.changeExactNotificationSetting();
  } catch (_) {
    // The OS may not expose this setting on this Android version.
  }
  return true;
}

async function sync(snapshot) {
  if (!native) return;
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') return;
  await ensureChannel();

  // Rebuild the next 14 days from FOR's local schedule, avoiding stale reminders after edits.
  try {
    const pending = await LocalNotifications.getPending();
    const existing = (pending.notifications || []).map(item => ({ id: item.id }));
    if (existing.length) await LocalNotifications.cancel({ notifications: existing });
  } catch (_) {
    // Continue and schedule the current reminders even if pending reminders could not be listed.
  }

  const supplements = Array.isArray(snapshot.supplements) ? snapshot.supplements : [];
  const logs = snapshot.supplementLogs || {};
  const snoozedUntil = snapshot.snoozedUntil || {};
  const now = new Date();
  const notifications = [];

  for (let offset = 0; offset < 14; offset += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 0, 0, 0, 0);
    const date = localDate(day);
    const weekday = day.getDay();

    for (const supplement of supplements) {
      if (!supplement || supplement.enabled === false || !(supplement.days || [0,1,2,3,4,5,6]).includes(weekday) || !supplement.time) continue;
      const key = `${date}_${supplement.id}`;
      const status = logs[key];
      if (status === 'taken' || status === 'skip') continue;

      if (status === 'snoozed') {
        const snoozeAt = Number(snoozedUntil[key] || 0);
        if (snoozeAt > Date.now()) notifications.push(makeNotification(supplement, date, new Date(snoozeAt), true));
        continue;
      }

      const [hour, minute] = String(supplement.time).split(':').map(Number);
      if (!Number.isInteger(hour) || !Number.isInteger(minute)) continue;
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0);
      if (at > now) notifications.push(makeNotification(supplement, date, at));
    }
  }

  if (notifications.length) {
    // Plugin/OS may apply its own cap; keep the queue to the user's next two weeks only.
    await LocalNotifications.schedule({ notifications });
  }
  window.dispatchEvent(new CustomEvent('for-native-scheduled', { detail: { count: notifications.length } }));
}

window.FORNativeNotifications = {
  isAvailable: () => native,
  requestPermission,
  sync,
};
document.addEventListener('DOMContentLoaded', () => window.dispatchEvent(new Event('for-native-ready')), { once: true });
