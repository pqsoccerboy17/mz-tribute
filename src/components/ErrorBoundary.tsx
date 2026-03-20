import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h1 className="font-display text-3xl text-cream mb-4">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-6">
              The page hit an unexpected error. Please refresh to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-ssu-blue text-cream rounded-lg hover:bg-ssu-blue-light transition-colors cursor-pointer"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
