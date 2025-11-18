import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function PrivateRoute({ children, allowedTypes }) {
  const { user, loading, apiCall } = useAuth()
  const [hasTeam, setHasTeam] = useState(null)
  const [redirectToJoin, setRedirectToJoin] = useState(false)

  useEffect(() => {
    if (user?.user_type === 'jogador') {
      apiCall('/teams/meustimes')
        .then(teams => {
          if (!teams || teams.length === 0) {
            setHasTeam(false)
            setRedirectToJoin(true)
          } else {
            setHasTeam(true)
          }
        })
        .catch(() => {
          setHasTeam(false)
          setRedirectToJoin(true)
        })
    } else {
      setHasTeam(true)
    }
  }, [user, apiCall])

  if (loading || hasTeam === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (redirectToJoin) {
    return <Navigate to="/invitations/join" replace />
  }

  if (allowedTypes && !allowedTypes.includes(user.user_type)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
