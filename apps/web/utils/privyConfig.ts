import { PrivyClientConfig } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "light", // Or "dark" or `#${string}`
    accentColor: "#007bff",
    logo: "https://example.com/logo.png",
  },
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    noPromptOnSignature: true,
  },
  loginMethods: ["email", "google", "twitter", "discord", "apple"],
};
