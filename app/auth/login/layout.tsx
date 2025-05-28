

import React, { Suspense } from 'react'

type Props = {
    children: React.ReactNode
}

const Layout = ({children}: Props) => {
  return (
      <Suspense>
          { children}
    </Suspense>
  )
}

export default Layout