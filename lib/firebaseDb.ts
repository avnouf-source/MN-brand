import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import { OFFICIAL_PERFUME_CATALOG } from './products'
import bcrypt from 'bcryptjs'

export interface FirebaseUser {
  id: string
  name: string
  email: string
  passwordHash?: string
  plainPassword?: string
  role: 'ADMIN' | 'SUB_ADMIN' | 'AGENT'
  department?: string
  status?: 'ONLINE' | 'OFFLINE'
  avatar?: string
  createdAt?: any
  updatedAt?: any
}

export interface FirebaseLead {
  id: string
  name: string
  phone: string
  email?: string | null
  stage: string
  tag: string
  assignedAgentId?: string | null
  assignedAgent?: { id: string; name: string } | null
  fragrancePreference?: string | null
  vipTier?: string | null
  leadSource?: string | null
  conversationStatus?: string | null
  notes?: string | null
  createdAt?: any
  updatedAt?: any
  conversation?: {
    id: string
    leadId: string
    lastMessageAt?: any
    messages?: FirebaseMessage[]
  }
}

export interface FirebaseMessage {
  id: string
  conversationId: string
  leadId?: string
  body: string
  direction: 'INBOUND' | 'OUTBOUND'
  type: 'TEXT' | 'TEMPLATE' | 'BOT' | 'NOTE' | 'MEDIA'
  senderType: 'agent' | 'customer' | 'bot' | 'system'
  senderId?: string | null
  isRead?: boolean
  mediaUrl?: string | null
  createdAt?: any
}

export interface FirebaseTemplate {
  id: string
  name: string
  body: string
  category: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  createdAt?: any
}

export interface FirebaseWhatsAppConfig {
  id?: string
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  businessAccountId: string
  updatedAt?: any
}

// 11 Seeded B Perfume Team Members
export const SEEDED_FIREBASE_USERS: FirebaseUser[] = [
  { id: 'usr-nouf-admin', name: 'Nouf', email: 'admin@bperfume.com', plainPassword: 'Nouf1234', role: 'ADMIN', department: 'Executive Management', status: 'ONLINE' },
  { id: 'usr-alnas-subadmin', name: 'Alnas', email: 'alnas@bperfume.com', plainPassword: 'Alnas1234', role: 'SUB_ADMIN', department: 'Client Operations', status: 'ONLINE' },
  { id: 'usr-rashid-subadmin', name: 'Rashid', email: 'rashid@bperfume.com', plainPassword: 'Rashid1234', role: 'SUB_ADMIN', department: 'Sales Leadership', status: 'ONLINE' },
  { id: 'usr-agent-adarsh', name: 'Adarsh', email: 'adarsh@bperfume.com', plainPassword: 'Adarsh0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
  { id: 'usr-agent-shifa', name: 'Fathimath Shifa', email: 'fathimathshifa@bperfume.com', plainPassword: 'FathimathShifa0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
  { id: 'usr-agent-nandana', name: 'Nandana', email: 'nandana@bperfume.com', plainPassword: 'Nandana0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
  { id: 'usr-agent-nouf', name: 'Nouf', email: 'nouf@bperfume.com', plainPassword: 'Nouf0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
  { id: 'usr-agent-rizvan', name: 'Rizvan', email: 'rizvan@bperfume.com', plainPassword: 'Rizvan0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
  { id: 'usr-agent-sajila', name: 'Sajila', email: 'sajila@bperfume.com', plainPassword: 'Sajila0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
  { id: 'usr-agent-sajna', name: 'Sajna', email: 'sajna@bperfume.com', plainPassword: 'Sajna0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
  { id: 'usr-agent-salih', name: 'Salih', email: 'salih@bperfume.com', plainPassword: 'Salih0000', role: 'AGENT', department: 'Fragrance Advisory', status: 'ONLINE' },
]

// Fallback in-memory store for builds or zero-credentials offline mode
const memoryStore = {
  users: [...SEEDED_FIREBASE_USERS],
  leads: [] as FirebaseLead[],
  messages: [] as FirebaseMessage[],
  templates: [] as FirebaseTemplate[],
  products: [...OFFICIAL_PERFUME_CATALOG],
  config: null as FirebaseWhatsAppConfig | null,
  refills: [] as any[],
}

// Helper: safe execution with memory fallback
async function withFallback<T>(firestoreOp: () => Promise<T>, fallbackOp: () => T): Promise<T> {
  if (!isFirebaseConfigured) {
    return fallbackOp()
  }
  try {
    return await firestoreOp()
  } catch (error) {
    console.warn('[Firebase DB] Firestore call failed, falling back to local store:', error)
    return fallbackOp()
  }
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getFirebaseUsers(): Promise<FirebaseUser[]> {
  return withFallback(
    async () => {
      const snap = await getDocs(collection(db, 'users'))
      if (snap.empty) {
        await seedInitialFirebaseData()
        return memoryStore.users
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseUser))
    },
    () => memoryStore.users
  )
}

export async function getFirebaseUserByEmail(email: string): Promise<FirebaseUser | null> {
  const cleanEmail = email.toLowerCase().trim()
  return withFallback(
    async () => {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as FirebaseUser
      }
      // Check seeded memory
      return memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail) || null
    },
    () => memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail) || null
  )
}

export async function createFirebaseUser(userData: Omit<FirebaseUser, 'id'>): Promise<FirebaseUser> {
  const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const newUser: FirebaseUser = { id, ...userData, createdAt: new Date().toISOString() }

  return withFallback(
    async () => {
      await setDoc(doc(db, 'users', id), newUser)
      memoryStore.users.push(newUser)
      return newUser
    },
    () => {
      memoryStore.users.push(newUser)
      return newUser
    }
  )
}

export async function updateFirebaseUser(id: string, data: Partial<FirebaseUser>): Promise<FirebaseUser | null> {
  return withFallback(
    async () => {
      await updateDoc(doc(db, 'users', id), { ...data, updatedAt: new Date().toISOString() })
      const idx = memoryStore.users.findIndex(u => u.id === id)
      if (idx !== -1) memoryStore.users[idx] = { ...memoryStore.users[idx], ...data }
      return memoryStore.users.find(u => u.id === id) || null
    },
    () => {
      const idx = memoryStore.users.findIndex(u => u.id === id)
      if (idx !== -1) {
        memoryStore.users[idx] = { ...memoryStore.users[idx], ...data }
        return memoryStore.users[idx]
      }
      return null
    }
  )
}

export async function deleteFirebaseUser(id: string): Promise<boolean> {
  return withFallback(
    async () => {
      await deleteDoc(doc(db, 'users', id))
      memoryStore.users = memoryStore.users.filter(u => u.id !== id)
      return true
    },
    () => {
      memoryStore.users = memoryStore.users.filter(u => u.id !== id)
      return true
    }
  )
}

// -------------------------------------------------------------
// LEAD OPERATIONS
// -------------------------------------------------------------
export async function getFirebaseLeads(filters?: { agentId?: string; stage?: string }): Promise<FirebaseLead[]> {
  return withFallback(
    async () => {
      let q = query(collection(db, 'leads'))
      if (filters?.agentId) {
        q = query(collection(db, 'leads'), where('assignedAgentId', '==', filters.agentId))
      }
      const snap = await getDocs(q)
      if (snap.empty && memoryStore.leads.length === 0) {
        await seedInitialFirebaseData()
        return memoryStore.leads
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseLead))
    },
    () => {
      let list = memoryStore.leads
      if (filters?.agentId) list = list.filter(l => l.assignedAgentId === filters.agentId)
      if (filters?.stage) list = list.filter(l => l.stage === filters.stage)
      return list
    }
  )
}

export async function getFirebaseLeadById(id: string): Promise<FirebaseLead | null> {
  return withFallback(
    async () => {
      const snap = await getDoc(doc(db, 'leads', id))
      if (snap.exists()) {
        const lead = { id: snap.id, ...snap.data() } as FirebaseLead
        // Attach messages
        const msgSnap = await getDocs(query(collection(db, 'messages'), where('leadId', '==', id)))
        const messages = msgSnap.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseMessage))
        lead.conversation = {
          id: `conv-${id}`,
          leadId: id,
          messages,
        }
        return lead
      }
      return memoryStore.leads.find(l => l.id === id) || null
    },
    () => {
      const lead = memoryStore.leads.find(l => l.id === id)
      if (!lead) return null
      const msgs = memoryStore.messages.filter(m => m.leadId === id || m.conversationId === `conv-${id}`)
      return {
        ...lead,
        conversation: { id: `conv-${id}`, leadId: id, messages: msgs },
      }
    }
  )
}

export async function createFirebaseLead(data: Partial<FirebaseLead>): Promise<FirebaseLead> {
  const id = data.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const lead: FirebaseLead = {
    id,
    name: data.name || 'New Client',
    phone: data.phone || `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
    email: data.email || null,
    stage: data.stage || 'NEW',
    tag: data.tag || 'NONE',
    assignedAgentId: data.assignedAgentId || null,
    assignedAgent: data.assignedAgent || null,
    fragrancePreference: data.fragrancePreference || 'Oud & Woody Extrait',
    vipTier: data.vipTier || 'Silver Tier',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return withFallback(
    async () => {
      await setDoc(doc(db, 'leads', id), lead)
      memoryStore.leads.unshift(lead)
      return lead
    },
    () => {
      memoryStore.leads.unshift(lead)
      return lead
    }
  )
}

export async function updateFirebaseLead(id: string, data: Partial<FirebaseLead>): Promise<FirebaseLead | null> {
  return withFallback(
    async () => {
      await updateDoc(doc(db, 'leads', id), { ...data, updatedAt: new Date().toISOString() })
      const idx = memoryStore.leads.findIndex(l => l.id === id)
      if (idx !== -1) memoryStore.leads[idx] = { ...memoryStore.leads[idx], ...data }
      return memoryStore.leads.find(l => l.id === id) || null
    },
    () => {
      const idx = memoryStore.leads.findIndex(l => l.id === id)
      if (idx !== -1) {
        memoryStore.leads[idx] = { ...memoryStore.leads[idx], ...data, updatedAt: new Date().toISOString() }
        return memoryStore.leads[idx]
      }
      return null
    }
  )
}

export async function deleteFirebaseLead(id: string): Promise<boolean> {
  return withFallback(
    async () => {
      await deleteDoc(doc(db, 'leads', id))
      memoryStore.leads = memoryStore.leads.filter(l => l.id !== id)
      return true
    },
    () => {
      memoryStore.leads = memoryStore.leads.filter(l => l.id !== id)
      return true
    }
  )
}

// -------------------------------------------------------------
// MESSAGES OPERATIONS
// -------------------------------------------------------------
export async function getFirebaseMessages(leadId: string): Promise<FirebaseMessage[]> {
  return withFallback(
    async () => {
      const q = query(collection(db, 'messages'), where('leadId', '==', leadId), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseMessage))
    },
    () => memoryStore.messages.filter(m => m.leadId === leadId || m.conversationId === `conv-${leadId}`)
  )
}

export async function createFirebaseMessage(data: Partial<FirebaseMessage>): Promise<FirebaseMessage> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const msg: FirebaseMessage = {
    id,
    conversationId: data.conversationId || `conv-${data.leadId}`,
    leadId: data.leadId,
    body: data.body || '',
    direction: data.direction || 'OUTBOUND',
    type: data.type || 'TEXT',
    senderType: data.senderType || 'agent',
    senderId: data.senderId || null,
    isRead: data.isRead ?? true,
    createdAt: new Date().toISOString(),
  }

  return withFallback(
    async () => {
      await setDoc(doc(db, 'messages', id), msg)
      memoryStore.messages.push(msg)
      return msg
    },
    () => {
      memoryStore.messages.push(msg)
      return msg
    }
  )
}

// -------------------------------------------------------------
// TEMPLATES & PRODUCTS & SETTINGS
// -------------------------------------------------------------
export async function getFirebaseTemplates(): Promise<FirebaseTemplate[]> {
  return withFallback(
    async () => {
      const snap = await getDocs(collection(db, 'templates'))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseTemplate))
    },
    () => memoryStore.templates
  )
}

export async function createFirebaseTemplate(data: Partial<FirebaseTemplate>): Promise<FirebaseTemplate> {
  const id = `tmpl-${Date.now()}`
  const tmpl: FirebaseTemplate = {
    id,
    name: data.name || 'welcome_vip',
    body: data.body || '',
    category: data.category || 'MARKETING',
    status: data.status || 'APPROVED',
    createdAt: new Date().toISOString(),
  }
  return withFallback(
    async () => {
      await setDoc(doc(db, 'templates', id), tmpl)
      memoryStore.templates.unshift(tmpl)
      return tmpl
    },
    () => {
      memoryStore.templates.unshift(tmpl)
      return tmpl
    }
  )
}

export async function getFirebaseWhatsAppConfig(): Promise<FirebaseWhatsAppConfig | null> {
  return withFallback(
    async () => {
      const snap = await getDoc(doc(db, 'settings', 'whatsapp'))
      if (snap.exists()) return snap.data() as FirebaseWhatsAppConfig
      return memoryStore.config
    },
    () => memoryStore.config
  )
}

export async function saveFirebaseWhatsAppConfig(config: FirebaseWhatsAppConfig): Promise<FirebaseWhatsAppConfig> {
  return withFallback(
    async () => {
      await setDoc(doc(db, 'settings', 'whatsapp'), { ...config, updatedAt: new Date().toISOString() })
      memoryStore.config = config
      return config
    },
    () => {
      memoryStore.config = config
      return config
    }
  )
}

// -------------------------------------------------------------
// INITIAL SEEDER (Automated on first boot)
// -------------------------------------------------------------
export async function seedInitialFirebaseData() {
  // Populate memory store first
  if (memoryStore.leads.length === 0) {
    const sampleLeads: FirebaseLead[] = [
      { id: 'lead-1', name: 'Aarav Sharma', phone: '+919876543210', stage: 'TALKING', tag: 'HOT', assignedAgentId: 'usr-agent-adarsh', fragrancePreference: 'CITYMAN Extrait', vipTier: 'Platinum VIP', createdAt: new Date().toISOString() },
      { id: 'lead-2', name: 'Priya Patel', phone: '+919876543211', stage: 'NEW', tag: 'WARM', assignedAgentId: 'usr-agent-shifa', fragrancePreference: 'Velvet Rose Pour Femme', vipTier: 'Gold Tier', createdAt: new Date().toISOString() },
      { id: 'lead-3', name: 'Rohan Verma', phone: '+919876543212', stage: 'ORDER_PLACED', tag: 'HOT', assignedAgentId: 'usr-agent-rizvan', fragrancePreference: 'Oud Royale Extrait', vipTier: 'Platinum VIP', createdAt: new Date().toISOString() },
      { id: 'lead-4', name: 'Ananya Iyer', phone: '+919876543213', stage: 'TALKING', tag: 'COLD', assignedAgentId: 'usr-agent-nouf', fragrancePreference: 'Amber Blanc', vipTier: 'Silver Tier', createdAt: new Date().toISOString() },
      { id: 'lead-5', name: 'Vikram Mehta', phone: '+919876543214', stage: 'DONE', tag: 'NONE', assignedAgentId: 'usr-agent-salih', fragrancePreference: 'Santal Imperial', vipTier: 'Gold Tier', createdAt: new Date().toISOString() },
    ]
    memoryStore.leads = sampleLeads
  }

  if (memoryStore.templates.length === 0) {
    memoryStore.templates = [
      { id: 'tmpl-1', name: 'vip_welcome_concierge', body: 'Welcome to B Perfume Haute Parfumerie, {{1}}. Your personal fragrance advisor is ready to assist you.', category: 'MARKETING', status: 'APPROVED', createdAt: new Date().toISOString() },
      { id: 'tmpl-2', name: 'perfume_order_dispatched', body: 'Honoured {{1}}, your bespoke B Perfume shipment #{{2}} has been carefully packaged and dispatched. Longevity guarantee enclosed.', category: 'UTILITY', status: 'APPROVED', createdAt: new Date().toISOString() },
      { id: 'tmpl-3', name: '60_day_refill_reminder', body: 'Dear {{1}}, our records indicate your {{2}} may be running low. Replenish with VIP complimentary shipping today.', category: 'MARKETING', status: 'APPROVED', createdAt: new Date().toISOString() },
    ]
  }

  // If live Firebase is configured, persist to Firestore
  if (isFirebaseConfigured) {
    try {
      for (const u of SEEDED_FIREBASE_USERS) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true })
      }
      for (const l of memoryStore.leads) {
        await setDoc(doc(db, 'leads', l.id), l, { merge: true })
      }
      for (const t of memoryStore.templates) {
        await setDoc(doc(db, 'templates', t.id), t, { merge: true })
      }
      for (const p of OFFICIAL_PERFUME_CATALOG) {
        await setDoc(doc(db, 'products', p.productCode), p, { merge: true })
      }
      console.log('[Firebase DB] Live Firestore initialized with luxury B Perfume collections.')
    } catch (e) {
      console.warn('[Firebase DB] Live seed encountered network limitation (using memory fallback):', e)
    }
  }
}
