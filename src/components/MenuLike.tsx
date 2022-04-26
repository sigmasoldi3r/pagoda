import React from 'react'

// Menu-like layout.
export default function MenuLike({ children }: { children: React.ReactNode }) {
  return (
    <div className="center-layout">
      <div className="center-layout flow-center">{children}</div>
    </div>
  )
}
