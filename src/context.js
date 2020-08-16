import React from 'react';

const GunContext = React.createContext()

function GunProvider({ value, ...rest }) {
  return <GunContext.Provider value={value} {...rest} />
}

export {
  GunContext,
  GunProvider
}