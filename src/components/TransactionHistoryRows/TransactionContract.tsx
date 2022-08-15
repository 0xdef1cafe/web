import { TransferType } from '@shapeshiftoss/unchained-client'
import { useTranslate } from 'react-polyglot'
import { ContractMethod, Direction } from 'hooks/useTxDetails/useTxDetails'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { selectAssetById } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { Amount } from './TransactionDetails/Amount'
import { ApprovalAmount } from './TransactionDetails/ApprovalAmount'
import { TransactionDetailsContainer } from './TransactionDetails/Container'
import { Row } from './TransactionDetails/Row'
import { Status } from './TransactionDetails/Status'
import { Text } from './TransactionDetails/Text'
import { TransactionId } from './TransactionDetails/TransactionId'
import { Transfers } from './TransactionDetails/Transfers'
import { TxGrid } from './TransactionDetails/TxGrid'
import { TransactionGenericRow } from './TransactionGenericRow'
import { TransactionRowProps } from './TransactionRow'
import { AssetTypes, isTokenMetadata, parseRelevantAssetFromTx } from './utils'

export const TransactionContract = ({
  txDetails,
  showDateAndGuide,
  compactMode,
  isOpen,
  toggleOpen,
  parentWidth,
}: TransactionRowProps) => {
  let assets = []
  if (txDetails.sellAsset) assets.push(parseRelevantAssetFromTx(txDetails, AssetTypes.Source))
  if (txDetails.buyAsset) assets.push(parseRelevantAssetFromTx(txDetails, AssetTypes.Destination))
  const translate = useTranslate()
  const isReceive = txDetails.tradeTx?.type === TransferType.Receive
  const interactsWithWithdrawMethod = txDetails.tx.data?.method === ContractMethod.Withdraw
  const isSend = txDetails.tradeTx?.type === TransferType.Send
  const i18n =
    isReceive && !txDetails.tx.data?.method ? txDetails.tradeTx?.type : txDetails.tx.data?.method
  const isFirstAssetOutgoing = interactsWithWithdrawMethod && isSend

  // TODO: Move to a better place at component-level to be passed down?
  const isRevoke = i18n === 'approve' && bnOrZero(txDetails.tx.data?.value).isZero()
  const titlePrefix = translate(
    (() => {
      if (txDetails.tx.data?.parser) {
        return `transactionRow.parser.${txDetails.tx.data?.parser}.${isRevoke ? 'revoke' : i18n}`
      }
      return 'transactionRow.unknown'
    })(),
  )

  // TODO: translation
  const titleSuffix = isRevoke ? ' approval' : ''

  const asset = useAppSelector(state =>
    selectAssetById(state, isTokenMetadata(txDetails.tx.data) ? txDetails.tx.data.assetId! : ''),
  )
  const symbol = asset?.symbol ?? ''
  const title = symbol ? `${titlePrefix} ${symbol}${titleSuffix}` : titlePrefix

  return (
    <>
      <TransactionGenericRow
        type={txDetails.direction || ''}
        toggleOpen={toggleOpen}
        compactMode={compactMode}
        title={title}
        blockTime={txDetails.tx.blockTime}
        symbol={txDetails.symbol}
        assets={assets}
        fee={parseRelevantAssetFromTx(txDetails, AssetTypes.Fee)}
        explorerTxLink={txDetails.explorerTxLink}
        txid={txDetails.tx.txid}
        txData={txDetails.tx.data}
        showDateAndGuide={showDateAndGuide}
        isFirstAssetOutgoing={isFirstAssetOutgoing}
        parentWidth={parentWidth}
      />
      <TransactionDetailsContainer isOpen={isOpen} compactMode={compactMode}>
        <Transfers compactMode={compactMode} transfers={txDetails.tx.transfers} />
        <TxGrid compactMode={compactMode}>
          {txDetails.direction === Direction.InPlace &&
          isTokenMetadata(txDetails.tx.data) &&
          txDetails.tx.data?.assetId &&
          txDetails.tx.data?.value ? (
            <ApprovalAmount
              assetId={txDetails.tx.data.assetId}
              value={txDetails.tx.data.value}
              isRevoke={isRevoke}
            />
          ) : null}
          <TransactionId explorerTxLink={txDetails.explorerTxLink} txid={txDetails.tx.txid} />
          <Row title='status'>
            <Status status={txDetails.tx.status} />
          </Row>
          {txDetails.tx.trade && (
            <Row title='transactionType'>
              <Text value={txDetails.tx.trade.dexName} />
            </Row>
          )}
          {txDetails.feeAsset && (
            <Row title='minerFee'>
              <Amount
                value={txDetails.tx.fee?.value ?? '0'}
                precision={txDetails.feeAsset.precision}
                symbol={txDetails.feeAsset.symbol}
              />
            </Row>
          )}
        </TxGrid>
      </TransactionDetailsContainer>
    </>
  )
}
