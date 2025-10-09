import {Navigate} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'

export default function PrivateRoute({ children, allowedTypes}) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedTypes && !allowedTypes.includes(user.user_type)){
        return <Navigate to="dashboard" replace/>
    }

    return children
} 
