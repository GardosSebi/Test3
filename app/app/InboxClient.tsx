'use client'

import { useState } from 'react'
import { Check, X, Users, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Invitation {
  id: string
  workspace: {
    id: string
    name: string
  }
  inviter: {
    id: string
    email: string
    name: string
  }
  status: string
  created_at: string
}

interface InboxClientProps {
  initialInvitations: Invitation[]
}

export default function InboxClient({ initialInvitations }: InboxClientProps) {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations)
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessing(invitationId)
    try {
      const res = await fetch(`/api/workspace/invitations/${invitationId}`, {
        method: 'POST',
      })

      if (res.ok) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
        // Refresh the page to update workspace data
        router.refresh()
      } else {
        let errorMessage = 'Eroare la acceptarea invitației'
        try {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json()
            errorMessage = errorData.error || errorMessage
          } else {
            const text = await res.text()
            errorMessage = text || errorMessage
          }
        } catch (parseError) {
          // Error parsing response
        }
        alert(errorMessage)
      }
    } catch (error) {
      alert('Eroare la acceptarea invitației')
    } finally {
      setProcessing(null)
    }
  }

  const handleDenyInvitation = async (invitationId: string) => {
    if (!confirm('Ești sigur că vrei să respingi această invitație?')) {
      return
    }

    setProcessing(invitationId)
    try {
      const res = await fetch(`/api/workspace/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
      } else {
        let errorMessage = 'Eroare la respingerea invitației'
        try {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json()
            errorMessage = errorData.error || errorMessage
          } else {
            const text = await res.text()
            errorMessage = text || errorMessage
          }
        } catch (parseError) {
          // Error parsing response
        }
        alert(errorMessage)
      }
    } catch (error) {
      alert('Eroare la respingerea invitației')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {invitations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invitații Workspace
          </h2>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {invitation.workspace.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Invitație de la{' '}
                        {invitation.inviter.name || invitation.inviter.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    disabled={processing === invitation.id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Acceptă
                  </button>
                  <button
                    onClick={() => handleDenyInvitation(invitation.id)}
                    disabled={processing === invitation.id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Respinge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

