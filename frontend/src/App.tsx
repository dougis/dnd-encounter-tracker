import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import PartiesPage from '@/features/parties/PartiesPage'
import EncountersPage from '@/features/encounters/EncountersPage'
import EncounterTracker from '@/features/encounters/EncounterTracker'
import CreaturesPage from '@/features/creatures/CreaturesPage'
import SubscriptionPage from '@/features/subscription/SubscriptionPage'
import AdminPage from '@/features/admin/AdminPage'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function App() {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        } 
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/parties" element={<PartiesPage />} />
                <Route path="/encounters" element={<EncountersPage />} />
                <Route path="/encounters/:id" element={<EncounterTracker />} />
                <Route path="/creatures" element={<CreaturesPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                
                {/* Admin routes */}
                {user?.isAdmin && (
                  <Route path="/admin" element={<AdminPage />} />
                )}
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App