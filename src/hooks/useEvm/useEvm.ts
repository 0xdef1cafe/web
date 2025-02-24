import { CHAIN_NAMESPACE, fromChainId } from '@shapeshiftoss/caip'
import { ETHWallet } from '@shapeshiftoss/hdwallet-core'
import { useEffect, useMemo, useState } from 'react'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { useWallet } from 'hooks/useWallet/useWallet'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { selectFeatureFlags } from 'state/slices/preferencesSlice/selectors'
import { useAppSelector } from 'state/store'

export const useEvm = () => {
  const { state } = useWallet()
  const [ethNetwork, setEthNetwork] = useState<string | null>(null)
  const featureFlags = useAppSelector(selectFeatureFlags)
  const supportedEvmChainIds = useMemo(
    () =>
      Array.from(getChainAdapterManager().keys()).filter(
        chainId => fromChainId(chainId).chainNamespace === CHAIN_NAMESPACE.Ethereum,
      ),
    // We want to explicitly react on featureFlags to get a new reference here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [featureFlags],
  )

  useEffect(() => {
    ;(async () => {
      const ethNetwork = await (state.wallet as ETHWallet)?.ethGetChainId?.()
      if (ethNetwork) setEthNetwork(bnOrZero(ethNetwork).toString())
    })()
  }, [state])

  const connectedEvmChainId = useMemo(
    () => supportedEvmChainIds.find(chainId => fromChainId(chainId).chainReference === ethNetwork),
    [ethNetwork, supportedEvmChainIds],
  )

  return { supportedEvmChainIds, connectedEvmChainId, setEthNetwork }
}
