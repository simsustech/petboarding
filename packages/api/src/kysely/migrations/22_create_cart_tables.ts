import type { Kysely } from 'kysely'
import {
  up as cartUp,
  down as cartDown
} from '@modular-api/fastify-cart/migrations/kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await cartUp(db)

  await db.schema
    .alterTable('bookings')
    .addColumn('order_id', 'integer', (col) => col.references('cart.orders.id'))
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('bookings').dropColumn('order_id').execute()

  await cartDown(db)
}
