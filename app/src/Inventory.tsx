import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { FC } from "react";
import { items } from "./Items";
import { craftItem, Item } from "./Modular";

const Craftable = ({ environment, item }: any) => {
  const wallet: any = useWallet();

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h4">{item.name}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => craftItem(environment, wallet, item)}>
          Craft
        </Button>
      </CardActions>
    </Card>
  );
};

const Craftables = ({ environment, items, resources }: any) => {
  return (
    <Grid container direction="row" spacing={2}>
      {items.map((item: Item) => (
        <Grid item xs={12} md={4} key={item.address.toBase58()}>
          <Craftable environment={environment} item={item} />
        </Grid>
      ))}
    </Grid>
  );
};

const Inventory = ({ environment, items, resources, inventory }: any) => {
  console.log(items);
  console.log(inventory);
  const inventoryItems = items
    .filter((item: Item) => item.name.length > 0)
    .map((item: Item) => item.address.toBase58())
    .map((address: string) => inventory[address]);

  console.log(inventoryItems);

  return (
    <Grid container direction="row">
      <Grid item xs={12} style={{ marginTop: "2rem" }}></Grid>
    </Grid>
  );
};

export default Inventory;
