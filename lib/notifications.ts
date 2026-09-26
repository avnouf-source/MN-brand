// Real-time Push Notifications & FCM Service
'use client'

export interface InAppNotification {
  id: string
  title: string
  body: string
  timestamp: string
  read: boolean
  type: 'LEAD_ASSIGNED' | 'STAGE_CHANGE' | 'DRIP_CAMPAIGN' | 'SYSTEM'
  agentId?: string
  leadId?: string
}

const NOTIFICATION_CHANNEL = 'bperfume_notifications_bus'

// Play luxury soft chime sound via Web Audio API (no external asset needed)
export function playNotificationChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // E5 then G#5 luxury chime
    osc.frequency.setValueAtTime(659.25, now)
    osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.12)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.46)
  } catch (err) {
    // Audio context may require prior user interaction
  }
}

// Request Native Web Push / Browser Notification Permission
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  try {
    const perm = await Notification.requestPermission()
    return perm === 'granted'
  } catch {
    return false
  }
}

// Show native browser notification if granted
export function showBrowserNotification(title: string, body: string, url: string = '/agent/workspace') {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/icons/icon-192.svg',
            badge: '/icons/icon-192.svg',
            vibrate: [150, 80, 150],
            data: { url },
          } as any)
        })
      } else {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.svg',
        })
      }
    } catch (e) {
      console.warn('Native notification error:', e)
    }
  }
}

// Broadcast in-app notification across tabs
export function broadcastNotification(notif: InAppNotification) {
  if (typeof window === 'undefined') return
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(NOTIFICATION_CHANNEL)
      channel.postMessage(notif)
      channel.close()
    }
    window.dispatchEvent(new CustomEvent('bperfume_notification', { detail: notif }))
  } catch (e) {
    console.warn('Broadcast notification error:', e)
  }
}

// Subscribe to in-app notifications
export function subscribeToNotifications(callback: (notif: InAppNotification) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let channel: BroadcastChannel | null = null
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(NOTIFICATION_CHANNEL)
    channel.onmessage = (event) => {
      if (event.data) {
        playNotificationChime()
        callback(event.data)
      }
    }
  }

  const customHandler = (e: Event) => {
    const detail = (e as CustomEvent).detail
    if (detail) {
      playNotificationChime()
      callback(detail)
    }
  }

  window.addEventListener('bperfume_notification', customHandler)

  return () => {
    if (channel) channel.close()
    window.removeEventListener('bperfume_notification', customHandler)
  }
}
