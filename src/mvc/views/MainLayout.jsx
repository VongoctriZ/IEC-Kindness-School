import { useState } from 'react'
import { Outlet }   from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import PostModal from '../../features/feed/PostModal'
import styles from './MainLayout.module.css'

export default function MainLayout() {
  const [postModalOpen, setPostModalOpen] = useState(false)

  return (
    <div className={styles.root}>
      <Navbar onPostClick={() => setPostModalOpen(true)} />

      <div className={styles.content}>
        <Outlet />
      </div>

      <button
        className={styles.fab}
        onClick={() => setPostModalOpen(true)}
        title="Đăng bài mới"
      >
        ✏️ <span className={styles.fabLabel}>Đăng bài</span>
      </button>

      {postModalOpen && (
        <PostModal onClose={() => setPostModalOpen(false)} />
      )}
    </div>
  )
}
