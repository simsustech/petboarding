import { db } from '../kysely/index.js'
import type { Announcements } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
type Announcement = Selectable<Announcements>
type NewAnnouncement = Insertable<Announcements>
type AnnouncementUpdate = Updateable<Announcements>

const defaultSelect = [
  'id',
  'title',
  'message',
  'type',
  'expirationDate'
] as (keyof Announcement)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<Announcement>
  select?: (keyof Announcement)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('announcements')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.expirationDate) {
    query = query.where('expirationDate', '>', criteria.expirationDate)
  }

  if (criteria.type) {
    query = query.where('type', '=', criteria.type)
  }

  return query.select(select)
}

export async function findAnnouncement({
  criteria,
  select
}: {
  criteria: Partial<Announcement>
  select?: (keyof Announcement)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findAnnouncements({
  criteria,
  select
}: {
  criteria: Partial<Announcement>
  select?: (keyof Announcement)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createAnnouncement(announcement: NewAnnouncement) {
  return db
    .insertInto('announcements')
    .values(announcement)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateAnnouncement(
  criteria: Partial<Announcement>,
  updateWith: AnnouncementUpdate
) {
  let query = db.updateTable('announcements')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteAnnouncement(id: number) {
  return db.deleteFrom('announcements').where('id', '=', id).executeTakeFirst()
}
