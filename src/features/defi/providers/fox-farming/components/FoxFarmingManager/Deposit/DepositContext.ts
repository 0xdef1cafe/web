import { createContext } from 'react'

import { FoxFarmingDepositActions, FoxFarmingDepositState } from './DepositCommon'

interface IDepositContext {
  state: FoxFarmingDepositState | null
  dispatch: React.Dispatch<FoxFarmingDepositActions> | null
}

export const DepositContext = createContext<IDepositContext>({ state: null, dispatch: null })
