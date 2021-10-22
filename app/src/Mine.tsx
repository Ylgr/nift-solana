import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import { useWallet } from "@solana/wallet-adapter-react";
import { mine, Resource } from "./Modular";

export const Mine = ({ environment, resources, items }: any) => {
  const wallet: any = useWallet();

  return (
    <Grid container direction="row" justifyContent="center">
      <Grid
        container
        item
        xs={12}
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        style={{ marginTop: "5rem" }}
      >
        {resources.map((resource: Resource) => (
          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4">{resource.name}</Typography>
                <Typography>Address: {resource.address.toBase58()}</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => mine(environment, wallet, resource)}>
                  Mine
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default Mine;
