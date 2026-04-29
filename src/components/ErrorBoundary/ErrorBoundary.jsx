import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.wrap}>
          <div className={styles.card}>
            <div className={styles.icon}>😵</div>
            <h2 className={styles.title}>Có lỗi xảy ra</h2>
            <p className={styles.msg}>
              {this.state.error?.message ?? 'Lỗi không xác định'}
            </p>
            <button
              className={styles.btn}
              onClick={() => this.setState({ error: null })}
            >
              Thử lại
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
