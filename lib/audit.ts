// Enterprise Audit Trail & Activity Logging Engine
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

export interface AuditLogEntry {
  id: string
  timestamp: string
  agentId: string
  agentName: string
  agentRole?: string
  action: string
  target: string
  severity: 'INFO' | 'WARNING' | 'SECURITY'
  details?: string
  ipAddress?: string
}

// In-memory persistent cache for serverless environments
const memoryAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    agentId: 'usr-agent-adarsh',
    agentName: 'Adarsh',
    action: 'Status Transition',
    target: 'Lead #4019 (Aarav Sharma) -> Follow-up',
    severity: 'INFO',
    details: 'Customer requested 60-day refill quote for CITYMAN Extrait',
    ipAddress: '103.21.124.12',
  },
  {
    id: 'audit-002',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    agentId: 'admin-super',
    agentName: 'Admin (Super Admin)',
    action: 'Bulk Round-Robin Route',
    target: '5,000 Inbound Leads -> 8 Advisors',
    severity: 'INFO',
    details: 'Automated 100% parity round-robin allocation',
    ipAddress: '157.48.91.44',
  },
  {
    id: 'audit-003',
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    agentId: 'usr-agent-shifa',
    agentName: 'Fathimath Shifa',
    action: 'Label Updated',
    target: 'Lead #3821 -> Important ⭐',
    severity: 'INFO',
    details: 'VIP luxury inquiry for 100ml Velvet Rose Pour Femme',
    ipAddress: '103.21.124.18',
  },
  {
    id: 'audit-004',
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
    agentId: 'usr-agent-rizvan',
    agentName: 'Rizvan',
    action: 'Order Closed',
    target: 'Lead #2910 (Kabir Singhania) -> ORDER_PLACED',
    severity: 'INFO',
    details: 'Closed 2x Oud Royale Extrait (₹46,000 INR)',
    ipAddress: '49.36.110.82',
  },
  {
    id: 'audit-005',
    timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
    agentId: 'usr-agent-nouf',
    agentName: 'Nouf',
    action: 'Client Note Added',
    target: 'Lead #4102 (Pooja Reddy)',
    severity: 'INFO',
    details: 'Prefers mild honey dew floral notes; avoiding heavy oud',
    ipAddress: '103.21.124.25',
  },
  {
    id: 'audit-006',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    agentId: 'usr-agent-salih',
    agentName: 'Salih',
    action: 'Lead Deleted',
    target: 'Lead #1094 (Duplicate entry removed)',
    severity: 'WARNING',
    details: 'Spam phone number verified invalid +910000000000',
    ipAddress: '49.36.110.99',
  },
]

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
  const newEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }

  // Prepend to memory cache
  memoryAuditLogs.unshift(newEntry)
  if (memoryAuditLogs.length > 500) {
    memoryAuditLogs.pop()
  }

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'audit_logs', newEntry.id), newEntry)
    } catch (e) {
      console.warn('[Audit Log] Firestore write fallback:', e)
    }
  }

  return newEntry
}

export async function getAuditLogs(max: number = 100): Promise<AuditLogEntry[]> {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(max))
      const snap = await getDocs(q)
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as AuditLogEntry)
      }
    } catch (e) {
      console.warn('[Audit Log] Firestore read fallback:', e)
    }
  }

  return memoryAuditLogs.slice(0, max)
}
