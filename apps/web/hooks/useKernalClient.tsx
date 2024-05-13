import { useEffect, useState } from 'react';
import {
  createPublicClient,
  http,
  Transport,
  Chain,
  type EIP1193Provider,
} from 'viem';
import { sepolia } from 'viem/chains';
import {
  KernelAccountClient,
  KernelSmartAccount,
  ZeroDevPaymasterClient,
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import {
  providerToSmartAccountSigner,
  ENTRYPOINT_ADDRESS_V06,
} from 'permissionless';
import usePrivyProvider from './usePrivyProvider';
import { USDC_TOKEN_ADDRESS } from '../utils';
import { ENTRYPOINT_ADDRESS_V06_TYPE } from 'permissionless/types';

export const useKernalClient = () => {
  const privyProvider = usePrivyProvider();

  const [smartAccount, setSmartAccount] =
    useState<
      KernelSmartAccount<
        ENTRYPOINT_ADDRESS_V06_TYPE,
        Transport,
        Chain | undefined
      >
    >();

  const [kernelClient, setKernelClient] =
    useState<
      KernelAccountClient<
        ENTRYPOINT_ADDRESS_V06_TYPE,
        Transport,
        Chain | undefined,
        KernelSmartAccount<ENTRYPOINT_ADDRESS_V06_TYPE>
      >
    >();

  const [paymasterClient, setPaymasterClient] =
    useState<ZeroDevPaymasterClient<typeof ENTRYPOINT_ADDRESS_V06>>();

  useEffect(() => {
    (async () => {
      if (!privyProvider) return;

      const smartAccountSigner = await providerToSmartAccountSigner(
        privyProvider as unknown as EIP1193Provider
      );

      const publicClient = createPublicClient({
        transport: http(`${process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_RPC}`),
      });

      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V06,
      });

      const _smartAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint: ENTRYPOINT_ADDRESS_V06,
      });

      const _paymasterClient = createZeroDevPaymasterClient({
        chain: sepolia,
        entryPoint: ENTRYPOINT_ADDRESS_V06,
        transport: http(`${process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_RPC}`),
      });

      const _kernelClient = createKernelAccountClient({
        account: _smartAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V06,
        chain: sepolia,
        bundlerTransport: http(
          `${process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_RPC}`
        ),
        middleware: {
          sponsorUserOperation: async ({ userOperation }) => {
            return _paymasterClient.sponsorUserOperation({
              userOperation,
              entryPoint: ENTRYPOINT_ADDRESS_V06,
              gasToken: USDC_TOKEN_ADDRESS,
            });
          },
        },
      });

      setSmartAccount(_smartAccount);
      setPaymasterClient(_paymasterClient);
      setKernelClient(_kernelClient);
    })();
  }, [privyProvider]);

  return { kernelClient, smartAccount, paymasterClient };
};

export default useKernalClient;
