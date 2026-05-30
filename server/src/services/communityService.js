import { getFirestore } from '../config/firebaseAdmin.js'

const mapDocs = (snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

export const listCommunityPosts = async ({ limit = 30 } = {}) => {
  const db = getFirestore()

  const [discussionsSnap, eventsSnap, groupsSnap] = await Promise.all([
    db.collection('discussions').orderBy('createdAt', 'desc').limit(limit).get().catch(() => null),
    db.collection('events').orderBy('date', 'asc').limit(limit).get().catch(() => null),
    db.collection('groups').orderBy('createdAt', 'desc').limit(limit).get().catch(() => null),
  ])

  const discussions = discussionsSnap ? mapDocs(discussionsSnap) : []
  const events = eventsSnap ? mapDocs(eventsSnap) : []
  const groups = groupsSnap ? mapDocs(groupsSnap) : []

  const posts = [
    ...discussions.map((p) => ({ ...p, type: 'discussion' })),
    ...events.map((p) => ({ ...p, type: 'event' })),
    ...groups.map((p) => ({ ...p, type: 'group', title: p.name || p.title })),
  ].sort((a, b) => {
    const aSec = a.createdAt?.seconds || (a.date ? new Date(a.date).getTime() / 1000 : 0)
    const bSec = b.createdAt?.seconds || (b.date ? new Date(b.date).getTime() / 1000 : 0)
    return bSec - aSec
  })

  return { posts: posts.slice(0, limit), discussions, events, groups }
}

export const createCommunityItem = async ({ type, data, author }) => {
  const db = getFirestore()
  const timestamp = new Date().toISOString()
  const base = {
    ...data,
    authorId: author.uid,
    authorName: author.name || author.email,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  if (type === 'discussion') {
    const ref = await db.collection('discussions').add({
      title: data.title,
      description: data.description || data.content || '',
      content: data.description || data.content || '',
      createdBy: author.uid,
      createdByName: author.name || author.email,
      role: data.role || author.role || 'admin',
      category: data.category || 'General',
      tags: data.tags || [],
      timestamp: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      likes: 0,
      replies: 0,
      views: 0,
      isPinned: false,
    })
    return { id: ref.id, type: 'discussion' }
  }

  if (type === 'event') {
    const ref = await db.collection('events').add({
      ...base,
      attendees: [],
      attendeeCount: 0,
    })
    return { id: ref.id, type: 'event' }
  }

  if (type === 'group') {
    const ref = await db.collection('groups').add({
      ...base,
      name: data.name || data.title,
      members: [],
      memberCount: 0,
    })
    return { id: ref.id, type: 'group' }
  }

  throw new Error('Invalid community type. Use discussion, event, or group.')
}
