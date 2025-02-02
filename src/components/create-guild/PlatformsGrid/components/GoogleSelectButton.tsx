import { useWeb3React } from "@web3-react/core"
import Button from "components/common/Button"
import useGoogleAuthWithCallback from "components/[guild]/JoinModal/hooks/useGoogleAuthWithCallback"
import { useSubmitWithSign } from "hooks/useSubmit"
import dynamic from "next/dynamic"
import { ArrowSquareIn, CaretRight } from "phosphor-react"
import { useMemo } from "react"
import { PlatformName } from "types"
import fetcher from "utils/fetcher"
import ConnectWalletButton from "./ConnectWalletButton"

type Props = {
  onSelection: (platform: PlatformName) => void
}

const GoogleSelectButton = ({ onSelection }: Props) => {
  const {
    callbackWithGoogleAuth,
    isAuthenticating,
    code,
    authData,
    isGoogleConnected,
  } = useGoogleAuthWithCallback(() =>
    onSubmit({
      platformName: "GOOGLE",
      authData,
    })
  )

  const DynamicCtaIcon = useMemo(
    () =>
      dynamic(async () =>
        !code && !isGoogleConnected ? ArrowSquareIn : CaretRight
      ),
    [code, isGoogleConnected]
  )

  const { onSubmit, isSigning, signLoadingText, isLoading } = useSubmitWithSign(
    (signedValidation) =>
      fetcher("/user/connect", {
        method: "POST",
        ...signedValidation,
      }),
    { onSuccess: () => onSelection("GOOGLE") }
  )

  const { account } = useWeb3React()

  if (!account) return <ConnectWalletButton />

  return (
    <Button
      onClick={
        isGoogleConnected ? () => onSelection("GOOGLE") : callbackWithGoogleAuth
      }
      isLoading={isAuthenticating || isSigning || isLoading}
      colorScheme="blue"
      loadingText={
        signLoadingText ||
        (isAuthenticating && "Check the popup window") ||
        "Connecting"
      }
      rightIcon={<DynamicCtaIcon />}
    >
      Select document
    </Button>
  )
}

export default GoogleSelectButton
