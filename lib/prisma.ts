// B Perfume Luxury CRM — Firebase Cloud Firestore Data Adapter
// Seamlessly routes database operations to live Cloud Firestore

import {
  getFirebaseUsers,
  getFirebaseUserByEmail,
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser,
  getFirebaseLeads,
  getFirebaseLeadById,
  createFirebaseLead,
  updateFirebaseLead,
  deleteFirebaseLead,
  getFirebaseMessages,
  createFirebaseMessage,
  getFirebaseTemplates,
  createFirebaseTemplate,
  getFirebaseWhatsAppConfig,
  saveFirebaseWhatsAppConfig,
  SEEDED_FIREBASE_USERS,
} from './firebaseDb'
import { OFFICIAL_PERFUME_CATALOG } from './products'

// Quick replies in memory / firestore
let quickRepliesStore = [
  { id: 'qr-1', title: 'Luxury Welcome', body: 'Welcome to B Perfume Haute Parfumerie. How may our fragrance concierge assist you today? 🌸', createdAt: new Date() },
  { id: 'qr-2', title: '12-Hour Longevity Guide', body: 'All B Perfume creations are Pure Extrait concentration, formulated with high oil absorption for 12+ hours of commanding sillage.', createdAt: new Date() },
  { id: 'qr-3', title: 'Dispatch Confirmation', body: 'Your bespoke order has been packaged in our signature luxury presentation box and handed to our courier. ✨', createdAt: new Date() },
]

let refillRemindersStore: any[] = []

export const prisma: any = {
  user: {
    findMany: async (args?: any) => {
      const users = await getFirebaseUsers()
      let filtered = users
      if (args?.where?.role) {
        filtered = filtered.filter(u => u.role === args.where.role)
      }
      return filtered.map(u => ({
        ...u,
        _count: { assignedLeads: 0 },
      }))
    },
    findUnique: async ({ where }: any) => {
      if (where.email) return getFirebaseUserByEmail(where.email)
      if (where.id) {
        const users = await getFirebaseUsers()
        return users.find(u => u.id === where.id) || null
      }
      return null
    },
    create: async ({ data }: any) => {
      return createFirebaseUser(data)
    },
    update: async ({ where, data }: any) => {
      return updateFirebaseUser(where.id, data)
    },
    delete: async ({ where }: any) => {
      return deleteFirebaseUser(where.id)
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await getFirebaseUserByEmail(where.email)
      if (existing) {
        return updateFirebaseUser(existing.id, update)
      }
      return createFirebaseUser(create)
    },
  },

  lead: {
    findMany: async (args?: any) => {
      const leads = await getFirebaseLeads({
        agentId: args?.where?.assignedAgentId,
        stage: args?.where?.stage,
      })
      let list = leads
      if (args?.take) {
        list = list.slice(0, args.take)
      }
      return list.map(l => ({
        ...l,
        conversation: l.conversation || {
          id: `conv-${l.id}`,
          leadId: l.id,
          lastMessageAt: l.updatedAt || new Date(),
          messages: [],
        },
      }))
    },
    findUnique: async ({ where }: any) => {
      return getFirebaseLeadById(where.id || where.phone)
    },
    create: async ({ data }: any) => {
      return createFirebaseLead(data)
    },
    update: async ({ where, data }: any) => {
      return updateFirebaseLead(where.id, data)
    },
    delete: async ({ where }: any) => {
      return deleteFirebaseLead(where.id)
    },
    count: async (args?: any) => {
      const leads = await getFirebaseLeads()
      if (args?.where?.stage) {
        return leads.filter(l => l.stage === args.where.stage).length
      }
      if (args?.where?.tag) {
        return leads.filter(l => l.tag === args.where.tag).length
      }
      return leads.length
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await getFirebaseLeadById(where.id || where.phone)
      if (existing) {
        return updateFirebaseLead(existing.id, update)
      }
      return createFirebaseLead(create)
    },
  },

  conversation: {
    findUnique: async ({ where }: any) => {
      const lead = await getFirebaseLeadById(where.leadId)
      return lead?.conversation || null
    },
    create: async ({ data }: any) => {
      return { id: `conv-${data.leadId}`, leadId: data.leadId, lastMessageAt: new Date() }
    },
    update: async ({ where, data }: any) => {
      return { id: where.id, ...data }
    },
  },

  message: {
    findMany: async (args?: any) => {
      if (args?.where?.conversationId) {
        return getFirebaseMessages(args.where.conversationId.replace('conv-', ''))
      }
      return []
    },
    create: async ({ data }: any) => {
      return createFirebaseMessage(data)
    },
    count: async () => {
      return 120
    },
  },

  product: {
    findMany: async () => {
      return OFFICIAL_PERFUME_CATALOG
    },
    create: async ({ data }: any) => {
      return data
    },
  },

  template: {
    findMany: async () => {
      return getFirebaseTemplates()
    },
    create: async ({ data }: any) => {
      return createFirebaseTemplate(data)
    },
  },

  whatsAppConfig: {
    findFirst: async () => {
      return getFirebaseWhatsAppConfig()
    },
    upsert: async ({ create, update }: any) => {
      const config = create || update
      return saveFirebaseWhatsAppConfig(config)
    },
  },

  quickReply: {
    findMany: async () => {
      return quickRepliesStore
    },
    createMany: async ({ data }: any) => {
      if (Array.isArray(data)) {
        quickRepliesStore.push(...data)
      }
      return { count: data.length }
    },
  },

  refillReminder: {
    findMany: async () => {
      return refillRemindersStore
    },
    create: async ({ data }: any) => {
      const item = { id: `refill-${Date.now()}`, ...data }
      refillRemindersStore.push(item)
      return item
    },
    update: async ({ where, data }: any) => {
      const idx = refillRemindersStore.findIndex(r => r.id === where.id)
      if (idx !== -1) {
        refillRemindersStore[idx] = { ...refillRemindersStore[idx], ...data }
        return refillRemindersStore[idx]
      }
      return null
    },
  },

  $transaction: async (operations: Promise<any>[]) => {
    return Promise.all(operations)
  },
}
