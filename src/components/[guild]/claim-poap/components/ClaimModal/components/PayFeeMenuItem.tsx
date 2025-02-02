import {
  Circle,
  HStack,
  Img,
  MenuItem,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react"
import { BigNumber } from "@ethersproject/bignumber"
import { formatUnits } from "@ethersproject/units"
import { useWeb3React } from "@web3-react/core"
import useAllowance from "components/[guild]/claim-poap/hooks/useAllowance"
import usePayFee from "components/[guild]/claim-poap/hooks/usePayFee"
import usePoapVault from "components/[guild]/CreatePoap/hooks/usePoapVault"
import { useWeb3ConnectionManager } from "components/_app/Web3ConnectionManager"
import { Chains, RPC } from "connectors"
import useCoinBalance from "hooks/useCoinBalance"
import useTokenBalance from "hooks/useTokenBalance"
import useTokenData from "hooks/useTokenData"
import { useEffect } from "react"
import { PoapContract } from "types"

type Props = {
  poapContractData: PoapContract
  setLoadingText: (newLoadingText: string) => void
}

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000"

const PayFeeMenuItem = ({
  poapContractData,
  setLoadingText,
}: Props): JSX.Element => {
  const { colorMode } = useColorMode()

  const { chainId } = useWeb3React()
  const { requestNetworkChange } = useWeb3ConnectionManager()

  const { vaultData } = usePoapVault(
    poapContractData.vaultId,
    poapContractData.chainId
  )
  const {
    data: { symbol, decimals },
    isValidating,
  } = useTokenData(Chains[poapContractData.chainId], vaultData?.token)
  const formattedPrice = formatUnits(vaultData?.fee ?? "0", decimals ?? 18)

  const { balance: usersCoinBalance, isLoading: isUsersCoinBalanceLoading } =
    useCoinBalance(poapContractData?.chainId)
  const { balance: usersTokenBalance, isLoading: isUsersTokenBalanceLoading } =
    useTokenBalance(
      vaultData?.token === NULL_ADDRESS ? null : vaultData?.token,
      poapContractData?.chainId
    )

  const sufficientBalance = (
    vaultData?.token === NULL_ADDRESS ? usersCoinBalance : usersTokenBalance
  )?.gte(vaultData?.fee ?? BigNumber.from(0))

  const allowance = useAllowance(vaultData?.token, poapContractData?.chainId)

  const { onSubmit, loadingText } = usePayFee(
    poapContractData.vaultId,
    poapContractData.chainId
  )

  useEffect(() => setLoadingText(loadingText), [loadingText])

  return (
    <Tooltip label="Insufficient balance" isDisabled={sufficientBalance}>
      <MenuItem
        onClick={
          chainId === poapContractData.chainId
            ? onSubmit
            : () => requestNetworkChange(poapContractData.chainId)
        }
        tabIndex={0}
        isDisabled={!sufficientBalance}
      >
        <Stack w="full" justifyContent="space-between" direction="row" fontSize="sm">
          <HStack>
            <SkeletonCircle
              boxSize={5}
              isLoaded={
                !isValidating &&
                !isUsersCoinBalanceLoading &&
                !isUsersTokenBalanceLoading
              }
            >
              <Circle
                size={5}
                bgColor={colorMode === "light" ? "white" : "gray.100"}
              >
                <Img
                  src={RPC[Chains[poapContractData.chainId]]?.iconUrls?.[0]}
                  alt={RPC[Chains[poapContractData.chainId]]?.chainName}
                  boxSize={3}
                />
              </Circle>
            </SkeletonCircle>
            <Skeleton
              isLoaded={
                !isValidating &&
                !isUsersCoinBalanceLoading &&
                !isUsersTokenBalanceLoading
              }
            >
              <Text as="span" pr={4}>
                {isValidating
                  ? "Pay fee"
                  : vaultData?.token === NULL_ADDRESS ||
                    allowance?.gte(vaultData?.fee ?? BigNumber.from(0))
                  ? `Pay ${formattedPrice} ${symbol}`
                  : `Allow ${formattedPrice} ${symbol} & pay`}
              </Text>
            </Skeleton>
          </HStack>

          <Text as="span" color="gray">
            {` on ${RPC[Chains[poapContractData.chainId]]?.chainName}`}
          </Text>
        </Stack>
      </MenuItem>
    </Tooltip>
  )
}

export default PayFeeMenuItem
