import { EIP1193Provider, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export const usePrivyProvider = () => {
  const { wallets } = useWallets();
  const [privyProvider, setPrivyProvider] = useState<EIP1193Provider>();

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  useEffect(() => {
    (async () => {
      if (!embeddedWallet) return;
      const provider = await embeddedWallet.getEthereumProvider();
      setPrivyProvider(provider);
    })();
  }, [embeddedWallet]);

  return privyProvider;
};

export default usePrivyProvider;
