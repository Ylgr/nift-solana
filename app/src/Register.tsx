import { Button, Grid, Typography, TextField } from "@mui/material";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { registerResource, registerItem, Resource } from "./Modular";

const RegisterResource = ({ environment }: any) => {
  const wallet: any = useWallet();

  const [name, setName] = useState("");
  const [rarity, setRarity] = useState(100);
  const [mint, setMint] = useState("");

  return (
    <Grid
      container
      item
      xs={10}
      md={8}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      style={{ marginTop: "5rem" }}
    >
      <Grid item xs={12}>
        <Typography variant="h6">Register a resource</Typography>
      </Grid>
      <Grid item xs={8} style={{ marginTop: 10 }}>
        <TextField
          id="name"
          onChange={(e) => setName(e.target.value)}
          label="Name"
          fullWidth
          value={name}
        />
      </Grid>
      <Grid item xs={8} style={{ marginTop: 10 }}>
        <TextField
          id="mint"
          onChange={(e) => setMint(e.target.value)}
          label="Mint"
          value={mint}
          fullWidth
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          id="rarity"
          onChange={(e) => setRarity(parseInt(e.target.value))}
          label="Rarity"
          value={rarity.toString()}
          fullWidth
        />
      </Grid>
      <Button
        color="primary"
        variant="outlined"
        size="large"
        onClick={() =>
          registerResource(environment, wallet, name, rarity, mint)
        }
        style={{ marginTop: 10 }}
      >
        Register Resource
      </Button>
    </Grid>
  );
};

const RegisterItem = ({ environment }: any) => {
  const wallet: any = useWallet();

  const [name, setName] = useState("");
  const [mint, setMint] = useState("");
  const [components, setComponents] = useState([
    { address: "", count: 0 },
    { address: "", count: 0 },
    { address: "", count: 0 },
  ]);

  return (
    <Grid
      container
      item
      xs={10}
      md={8}
      direction="row"
      justifyContent="flexStart"
      alignItems="center"
      style={{ marginTop: "5rem" }}
    >
      <Grid item xs={12}>
        <Typography variant="h6">Register an item</Typography>
      </Grid>
      <Grid item xs={12} md={8} style={{ marginTop: 10 }}>
        <TextField
          id="name"
          onChange={(e) => setName(e.target.value)}
          label="Name"
          value={name}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={8} style={{ marginTop: 10 }}>
        <TextField
          id="mint"
          onChange={(e) => setMint(e.target.value)}
          label="Mint"
          value={mint}
          fullWidth
        />
      </Grid>
      {components.map((component, i) => (
        <Grid
          container
          item
          xs={12}
          style={{ marginTop: 10 }}
          justifyContent={"space-between"}
        >
          <Grid item xs={8}>
            <TextField
              id={"component" + i}
              onChange={(e) =>
                setComponents((components) => {
                  const newComponents = [...components];

                  newComponents[i].address = e.target.value;
                  return newComponents;
                })
              }
              label={"Component item mint " + i}
              value={component.address}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              id={"Component count " + i}
              onChange={(e) =>
                setComponents((components) => {
                  const newComponents = [...components];
                  newComponents[i].count = parseInt(e.target.value);
                  return newComponents;
                })
              }
              label="Count"
              value={component.count.toString()}
            />
          </Grid>
        </Grid>
      ))}
      <Button
        color="primary"
        variant="outlined"
        size="large"
        onClick={() =>
          registerItem(
            environment,
            wallet,
            name,
            components.map((comp) => comp.count),
            components.map((comp) => comp.address),
            mint
          )
        }
        style={{ marginTop: 10 }}
      >
        Register Item
      </Button>
    </Grid>
  );
};

export const Register = ({ environment }: any) => {
  return (
    <Grid container direction="row" justifyContent="center">
      <RegisterResource environment={environment} />
      <RegisterItem environment={environment} />
    </Grid>
  );
};

export default Register;
