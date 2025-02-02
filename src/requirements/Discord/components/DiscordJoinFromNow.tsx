import { FormControl, FormLabel, Stack } from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import RelativeTimeInput from "components/common/RelativeTimeInput"
import { useFormState } from "react-hook-form"
import parseFromObject from "utils/parseFromObject"

type Props = {
  baseFieldPath: string
}

const DiscordJoinFromNow = ({ baseFieldPath }: Props): JSX.Element => {
  const { errors } = useFormState()

  return (
    <Stack w="full">
      <FormControl
        isInvalid={!!parseFromObject(errors, baseFieldPath).data?.memberSince}
      >
        <FormLabel>Minimum account age</FormLabel>

        <RelativeTimeInput
          fieldName={`${baseFieldPath}.data.memberSince`}
          checkForTouched="data"
        />

        <FormErrorMessage>
          {parseFromObject(errors, baseFieldPath).data?.memberSince?.message}
        </FormErrorMessage>
      </FormControl>
    </Stack>
  )
}

export default DiscordJoinFromNow
