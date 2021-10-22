import { FC, useMemo, useState } from "react";
import Header from "./Header";
import Craft from "./Craft";
import Mine from "./Mine";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { useWallet } from "@solana/wallet-adapter-react";
import InitializeModular from "./Init";
import Register from "./Register";
import Inventory from "./Inventory";

import { getModular, Resource, getInventory } from "./Modular";
import About from "./About";

export const App = ({ environment, resources, items, inventory }: any) => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route exact path="/">
          <About />
        </Route>
        <Route path="/craft">
          <Craft
            environment={environment}
            items={items}
            resources={resources}
          />
        </Route>
        <Route path="/inventory">
          <Inventory
            environment={environment}
            items={items}
            resources={resources}
            inventory={inventory}
          />
        </Route>

        <Route path="/mine">
          <Mine environment={environment} items={items} resources={resources} />
        </Route>
        <Route path="/register">
          <Register environment={environment} />
        </Route>
      </Switch>
    </Router>
  );
};

const AppWithData = ({ environment }: any) => {
  const wallet: any = useWallet();

  const [resources, setResources] = useState([]);
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState({});

  useMemo(() => {
    if (wallet) {
      getModular(environment, wallet).then((modular) => {
        if (modular) {
          const items = modular.items
            .map((item: any) => ({
              ...item,
              name: String.fromCharCode(
                ...item.name.filter((char: number) => char !== 0)
              ),
            }))
            .filter((item: Resource) => item.name.length !== 0);
          setResources(
            modular.resources
              .map((resource: any) => {
                const name = String.fromCharCode(
                  ...resource.name.filter((char: number) => char !== 0)
                );
                return {
                  ...resource,
                  name,
                };
              })
              .filter((resource: Resource) => resource.name.length !== 0)
          );
          setItems(items);
          getInventory(environment, wallet, items).then(setInventory);
        }
      });
    }
  }, [wallet]);

  return (
    <App
      environment={environment}
      resources={resources}
      items={items}
      inventory={inventory}
    />
  );
};

export default AppWithData;
