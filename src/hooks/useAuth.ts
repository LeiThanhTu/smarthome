import { useEffect } from 'react'
import { authStore } from '../store/auth.store'


export function useAuth(){
const user = authStore(state => state.user)
const accessToken = authStore(state => state.accessToken)
const logout = authStore(state => state.logout)
const hydrate = authStore(state => state.hydrate)


useEffect(()=>{ hydrate() }, [])


return { user, accessToken, isAuthenticated: !!user && !!accessToken, logout }
}