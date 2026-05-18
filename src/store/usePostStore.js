import { create } from 'zustand'
import { FEED_PAGE_SIZE, FEED_LOAD_MORE_SIZE } from '../lib/constants'

const usePostStore = create((set, get) => ({
  posts:      [],
  likedPosts: new Set(),   // Set<postId>
  loading:    false,
  feedLimit:  FEED_PAGE_SIZE,

  setPosts:      (posts)      => set({ posts }),
  setLoading:    (loading)    => set({ loading }),
  setLikedPosts: (likedPosts) => set({ likedPosts }),
  increaseLimit: ()           => set(s => ({ feedLimit: s.feedLimit + FEED_LOAD_MORE_SIZE })),

  /** Optimistic like toggle — revert nếu server call thất bại */
  toggleLikeLocally(postId) {
    const { posts, likedPosts } = get()
    const isLiked = likedPosts.has(postId)
    const newSet  = new Set(likedPosts)
    isLiked ? newSet.delete(postId) : newSet.add(postId)

    set({
      likedPosts: newSet,
      posts: posts.map(p =>
        p.id === postId
          ? { ...p, likeCount: p.likeCount + (isLiked ? -1 : 1) }
          : p,
      ),
    })

    return !isLiked  // returns new liked state
  },

  prependPost(post) {
    set(s => ({ posts: [post, ...s.posts] }))
  },

  removePost(postId) {
    set(s => ({ posts: s.posts.filter(p => p.id !== postId) }))
  },
}))

export default usePostStore
