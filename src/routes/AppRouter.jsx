import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute   from './ProtectedRoute'
import MainLayout       from '../mvc/views/MainLayout'
import AuthLayout       from '../mvc/views/AuthLayout'
import LoginPage        from '../features/auth/LoginPage'
import FeedPage         from '../features/feed/FeedPage'
import LeaderboardPage  from '../features/ranking/LeaderboardPage'
import ProfilePage      from '../features/profile/ProfilePage'
import SearchPage       from '../features/search/SearchPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index              element={<FeedPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="search"      element={<SearchPage />} />
          <Route path="profile"     element={<ProfilePage />} />
          <Route path="profile/:uid" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
