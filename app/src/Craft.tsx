import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { FC } from "react";
import { craftItem, Item } from "./Modular";

const Craftable = ({ environment, item }: any) => {
  const wallet: any = useWallet();

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h4">{item.name}</Typography>
        <Typography>Address: {item.address.toBase58()}</Typography>
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
    <Grid container direction="row" spacing={2} justifyContent="space-around">
      {items.map((item: Item) => (
        <Grid item xs={12} md={5} key={item.address.toBase58()}>
          <Craftable environment={environment} item={item} />
        </Grid>
      ))}
    </Grid>
  );
};

const RawMaterials: FC = () => {
  return <></>;
};
const Craft = ({ environment, items, resources }: any) => {
  return (
    <Grid container direction="row">
      <Grid item xs={12} style={{ marginTop: "2rem" }}>
        <Craftables
          environment={environment}
          items={items}
          resources={resources}
        />
      </Grid>
      <Grid item xs={12}>
        <RawMaterials />
      </Grid>
    </Grid>
  );
};

export default Craft;
