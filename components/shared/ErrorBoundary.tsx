'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UI Boundary Caught Error]:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-400/30 text-white shadow-xl max-w-lg mx-auto my-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <AlertCircle size={22} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {this.props.fallbackTitle || 'Component Recovered Gracefully'}
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {this.props.fallbackMessage ||
              'A temporary issue occurred while rendering this module. You can reload this view without losing your place.'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <RotateCcw size={13} />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
