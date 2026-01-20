import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import InboxClient from './InboxClient'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function InboxPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const invitations = await prisma.workspaceInvitation.findMany({
    where: {
      userId: session.user.id,
      status: 'PENDING',
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      inviter: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return (
    <InboxClient
      initialInvitations={invitations.map((inv) => ({
        id: inv.id,
        workspace: inv.workspace,
        inviter: inv.inviter,
        status: inv.status,
        created_at: inv.created_at.toISOString(),
      }))}
    />
  )
}
