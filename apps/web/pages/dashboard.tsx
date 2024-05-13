import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import { ToastContainer, toast } from 'react-toastify';
import { useAccount, useReadContract } from 'wagmi';
import {
  ERC20_ABI,
  USDC_TOKEN_ADDRESS,
  PAYMENT_PROCESSOR_ABI,
  PAYMENT_PROCESSOR_ADDRESS,
  SEPOLIA_SCAN_URL,
} from '../utils';
import useKernalClient from '../hooks/useKernalClient';
import { sepolia } from 'viem/chains';
import { getERC20PaymasterApproveCall } from '@zerodev/sdk';

export default function DashboardPage() {
  const router = useRouter();
  const account = useAccount();
  const { wallets } = useWallets();
  const { kernelClient, smartAccount, paymasterClient } = useKernalClient();

  const { ready, authenticated, user, sendTransaction, logout } = usePrivy();

  const [isLoading, setIsLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(BigInt(0));

  const tokenBalanceData = useReadContract({
    abi: ERC20_ABI,
    address: USDC_TOKEN_ADDRESS,
    functionName: 'balanceOf',
    args: [account.address],
    chainId: sepolia.id,
  });

  useEffect(() => {
    (async () => {
      if (!account || !tokenBalanceData?.data) return;
      setTokenBalance(tokenBalanceData.data as bigint);
    })();
  }, [account, tokenBalanceData?.data]);

  const eoa =
    wallets.find((wallet) => wallet.walletClientType === 'privy') || wallets[0];

  useEffect(() => {
    (async () => {
      if (!eoa) return;
    })();
  }, [eoa]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const onJoin = useCallback(async () => {
    if (
      !sendTransaction ||
      !account ||
      !kernelClient ||
      !tokenBalance ||
      !smartAccount ||
      !paymasterClient
    ) {
      console.error('Wallet has not fully initialized yet');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Joining...');
    try {
      const txHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await smartAccount.encodeCallData([
            await getERC20PaymasterApproveCall(paymasterClient, {
              gasToken: USDC_TOKEN_ADDRESS,
              approveAmount: BigInt('1000000000000'),
            }),
            {
              to: USDC_TOKEN_ADDRESS,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [PAYMENT_PROCESSOR_ADDRESS, BigInt('1000000000000')],
              }),
              value: BigInt(0),
            },
            {
              to: PAYMENT_PROCESSOR_ADDRESS,
              data: encodeFunctionData({
                abi: PAYMENT_PROCESSOR_ABI,
                functionName: 'receivePayment',
                args: [BigInt(1234)],
              }),
              value: BigInt(0),
            },
          ]),
        },
      });

      // const txHash = await kernelClient.sendTransactions({
      //   transactions: [
      //     {
      //       to: USDC_TOKEN_ADDRESS,
      //       data: encodeFunctionData({
      //         abi: ERC20_ABI,
      //         functionName: "approve",
      //         args: [PAYMENT_PROCESSOR_ADDRESS, tokenBalance],
      //       }),
      //     },
      //     {
      //       to: PAYMENT_PROCESSOR_ADDRESS,
      //       data: encodeFunctionData({
      //         abi: PAYMENT_PROCESSOR_ABI,
      //         functionName: "receivePayment",
      //         args: [BigInt(1234)],
      //       }),
      //     },
      //   ],
      // });

      toast.update(toastId, {
        render: (
          <a
            href={`${SEPOLIA_SCAN_URL}/tx/${txHash}`}
            target="_blank"
            color="#FF8271"
          >
            Click here to see your join transaction.
          </a>
        ),
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      toast.update(toastId, {
        render:
          'Failed to Join. Please see the developer console for more information.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
      console.error(`Failed with error: ${error}`);
    }
    setIsLoading(false);
  }, [
    sendTransaction,
    account,
    kernelClient,
    tokenBalance,
    smartAccount,
    paymasterClient,
  ]);

  return (
    <>
      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        <ToastContainer />
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy x ZeroDev Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap">
              <button
                onClick={onJoin}
                disabled={isLoading || !ready}
                className="text-sm bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 py-2 px-4 rounded-md text-white"
              >
                {!isLoading ? 'Join game' : 'Joining...'}
              </button>
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Smart Wallet Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${SEPOLIA_SCAN_URL}/address/${account?.address}`}
            >
              {account.address}
            </a>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Signer Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${SEPOLIA_SCAN_URL}/address/${eoa?.address}`}
            >
              {eoa?.address}
            </a>
            <p>USDC Balance: {Number(tokenBalance.toString()) / 10 ** 6}</p>
          </>
        ) : null}
      </main>
    </>
  );
}
