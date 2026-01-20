import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const admin = await isAdmin()

  if (!admin) {
    redirect('/app')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: {
          tasks: true,
          projects: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return (
    <AdminClient
      initialUsers={users.map((user) => ({
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      }))}
    />
  )
}

