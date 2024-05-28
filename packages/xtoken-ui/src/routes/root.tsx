import { Outlet } from "react-router-dom";
import Header from "../components/header";
import AppProvider from "../providers/app-provider";
import GraphqlProvider from "../providers/graphql-provider";
import RainbowProvider from "../providers/rainbow-provider";

export default function Root() {
  return (
    <GraphqlProvider>
      <RainbowProvider>
        <AppProvider>
          <Header />
          <Outlet />
          {/* <Footer /> */}
        </AppProvider>
      </RainbowProvider>
    </GraphqlProvider>
  );
}
