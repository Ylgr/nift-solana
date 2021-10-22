import { Grid, Typography } from "@mui/material";

export default () => (
  <Grid container justifyContent="space-around" style={{ marginTop: 10 }}>
    <Grid item xs={11} md={8}>
      <Typography>
        Modular is a program on Solana that allows you to craft NFTs from other
        NFTs.
      </Typography>
      <br />
      <Typography>
        Resources represent base tokens that aren't craftable.
      </Typography>
      <br />
      <Typography>Items are tokens that are craftable.</Typography>
      <br />
      <Typography>
        When you register a resource or an item with Modular, you give mint
        authority over that token to the modular program. You don't need mint
        authority over the token of a component item of an item.
      </Typography>
      <br />
      <Typography>
        To get started, select your wallet and go to mine to mine a base
        resource. You can navigate to craft to craft an existing item. Or, you
        can register your own item or resource on the resource tab.
      </Typography>
      <br />
      <Typography>
        One limitation that we haven't addressed yet is that you need to create
        an associated token account for the resource or item token before you
        attempt to mine or craft. In the future this should happen
        automatically! In the meantime, you can do this using the `spl-token`
        command line tool.
      </Typography>
    </Grid>
  </Grid>
);
