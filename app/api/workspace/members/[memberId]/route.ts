import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Remove member from workspace
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> | { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memberId } = await Promise.resolve(params)

    // Get member
    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        workspace: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Verify user is workspace owner
    if (member.workspace.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only workspace owner can remove members' },
        { status: 403 }
      )
    }

    await prisma.workspaceMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Error('Error removing workspace member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

