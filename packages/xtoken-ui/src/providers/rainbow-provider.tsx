import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, connectorsForWallets, getDefaultWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { imTokenWallet, okxWallet, safeWallet, talismanWallet } from "@rainbow-me/rainbowkit/wallets";
import { PropsWithChildren } from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getChainConfigs, isTronChain } from "../utils";

const projectId = import.meta.env.VITE_WALLET_CONNECT_ID || "";
const appName = "Darwinia Bridge";

const { chains, publicClient } = configureChains(
  getChainConfigs()
    .filter((c) => !isTronChain(c))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ tokens, ...chain }) => chain),
  [publicProvider()],
);

const { wallets } = getDefaultWallets({ appName, projectId, chains });

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "More",
    wallets: [
      okxWallet({ projectId, chains }),
      imTokenWallet({ projectId, chains }),
      talismanWallet({ chains }),
      safeWallet({ chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function RainbowProvider({ children }: PropsWithChildren<unknown>) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        theme={darkTheme({ borderRadius: "large", accentColor: "#FF0083" })}
        chains={chains}
        appInfo={{ appName }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
