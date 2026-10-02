import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client, MeasurementSession, MeasurementTemplate } from "./types";
import { DEFAULT_TEMPLATES } from "./data/defaultTemplates";

const KEYS = {
  templates: "@mtm/templates",
  clients: "@mtm/clients",
  sessions: "@mtm/sessions",
} as const;

async function readList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

async function writeList<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Templates ----

export async function getTemplates(): Promise<MeasurementTemplate[]> {
  const templates = await readList<MeasurementTemplate>(KEYS.templates);
  if (templates.length === 0) {
    // Seed with starter templates on first launch. The tailor can edit,
    // delete, or add entirely custom ones from here on.
    await writeList(KEYS.templates, DEFAULT_TEMPLATES);
    return DEFAULT_TEMPLATES;
  }
  return templates;
}

export async function getTemplate(id: string): Promise<MeasurementTemplate | undefined> {
  const templates = await getTemplates();
  return templates.find((t) => t.id === id);
}

export async function saveTemplate(template: MeasurementTemplate): Promise<void> {
  const templates = await getTemplates();
  const idx = templates.findIndex((t) => t.id === template.id);
  if (idx >= 0) templates[idx] = template;
  else templates.push(template);
  await writeList(KEYS.templates, templates);
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = await getTemplates();
  await writeList(KEYS.templates, templates.filter((t) => t.id !== id));
}

// ---- Clients ----

export async function getClients(): Promise<Client[]> {
  return readList<Client>(KEYS.clients);
}

export async function saveClient(client: Client): Promise<void> {
  const clients = await getClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) clients[idx] = client;
  else clients.push(client);
  await writeList(KEYS.clients, clients);
}

export async function getClient(id: string): Promise<Client | undefined> {
  const clients = await getClients();
  return clients.find((c) => c.id === id);
}

// ---- Measurement sessions ----

export async function getSessions(): Promise<MeasurementSession[]> {
  return readList<MeasurementSession>(KEYS.sessions);
}

export async function getSessionsForClient(clientId: string): Promise<MeasurementSession[]> {
  const sessions = await getSessions();
  return sessions
    .filter((s) => s.clientId === clientId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveSession(session: MeasurementSession): Promise<void> {
  const sessions = await getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  await writeList(KEYS.sessions, sessions);
}
