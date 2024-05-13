import { createEcdsaKernelAccountClient } from "@zerodev/presets/zerodev";
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
import {
  ENTRYPOINT_ADDRESS_V06,
  providerToSmartAccountSigner,
} from "permissionless";
import { type EIP1193Provider } from "viem";
import { sepolia } from "viem/chains";

export const signerToZeroDevSmartAccount = async ({
  signer,
}: {
  signer: EIP1193Provider;
}): Promise<EIP1193Provider> => {
  const smartAccountSigner = await providerToSmartAccountSigner(signer);

  const kernelClient = await createEcdsaKernelAccountClient({
    chain: sepolia,
    projectId: `${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`,
    signer: smartAccountSigner,
    paymaster: "SPONSOR",
    entryPointAddress: ENTRYPOINT_ADDRESS_V06,
  });

  console.log("kernelClient address: ", kernelClient.account.address);

  const kernelProvider = new KernelEIP1193Provider(kernelClient);
  return kernelProvider as EIP1193Provider;
};
