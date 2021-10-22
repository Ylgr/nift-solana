import { Connection, PublicKey } from "@solana/web3.js";
import { Program, Provider, Wallet, utils, web3 } from "@project-serum/anchor";
import idl from "./idl.json";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { associatedAddress } from "@project-serum/anchor/dist/cjs/utils/token";

enum Environment {
  localhost,
  devnet,
}

export type Resource = {
  address: PublicKey;
  name: string;
  rarity: number;
};

export type Recipe = {
  item: PublicKey;
  count: number;
};

export type Item = {
  address: PublicKey;
  name: string;
  recipes: Recipe[];
};

const programID = new PublicKey(idl.metadata.address);
const getModularAddress = (environment: Environment) => {
  if (environment === Environment.localhost) {
    return new PublicKey("Gys3HBiLvkse2kXm78pyzPFykvNhywdsBjm41DWPDky8");
  }
  return new PublicKey("3ooWHHm6pWukM2JmcDscaCbHXD9wEjVEBekR7zKm9vM6");
};

async function getProvider(environment: Environment, wallet: Wallet) {
  /* create the provider and return it to the caller */
  /* network set to local network for now */
  const network =
    environment === Environment.localhost
      ? "http://127.0.0.1:8899"
      : "https://api.devnet.solana.com";
  const connection = new Connection(network, "processed");
  const provider = new Provider(connection, wallet, {
    preflightCommitment: "processed",
  });
  return provider;
}

async function getModular(environment: Environment, wallet: Wallet) {
  const provider = await getProvider(environment, wallet);
  const program = new Program(idl as any, programID, provider);
  console.log(program.account);
  const modular = program.account.modular;
  const modularInitialized = await modular.fetch(
    getModularAddress(environment)
  );
  return modularInitialized;
}

async function initModular(environment: Environment, wallet: Wallet) {
  const modular = web3.Keypair.generate();
  const provider = await getProvider(environment, wallet);
  const program = new Program(idl as any, programID, provider);
  await program.rpc.initializeModular({
    accounts: {
      modular: modular.publicKey,
    },
    instructions: [await program.account.modular.createInstruction(modular)],
    signers: [modular],
  });
  console.log(modular.publicKey.toBase58());
}

async function registerResource(
  environment: Environment,
  wallet: Wallet,
  name: string,
  rarity: number,
  mintAddress: string
) {
  const mint = new PublicKey(mintAddress);

  const modular = getModularAddress(environment);
  if (!modular) {
    return;
  }
  const provider = await getProvider(environment, wallet);
  const program = new Program(idl as any, programID, provider);
  await program.rpc.registerResource(name, rarity, {
    accounts: {
      modular,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      miner: provider.wallet.publicKey,
    },
  });
}

async function registerItem(
  environment: Environment,
  wallet: Wallet,
  name: string,
  counts: number[],
  components: string[],
  mintAddress: string
) {
  const itemMint = new PublicKey(mintAddress);

  const modular = getModularAddress(environment);
  if (!modular) {
    return;
  }

  const itemOne =
    components[0].length > 0
      ? new PublicKey(components[0])
      : web3.Keypair.generate().publicKey;
  const itemTwo =
    components[1].length > 0
      ? new PublicKey(components[1])
      : web3.Keypair.generate().publicKey;
  const itemThree =
    components[2].length > 0
      ? new PublicKey(components[2])
      : web3.Keypair.generate().publicKey;

  const provider = await getProvider(environment, wallet);
  const program = new Program(idl as any, programID, provider);
  await program.rpc.registerItem(name, counts, {
    accounts: {
      miner: provider.wallet.publicKey,
      itemMint,
      itemOne,
      itemTwo,
      itemThree,
      modular,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}

async function mine(
  environment: Environment,
  wallet: Wallet,
  resource: Resource
) {
  const modular = getModularAddress(environment);
  if (!modular) {
    return;
  }

  const provider = await getProvider(environment, wallet);
  const program = new Program(idl as any, programID, provider);

  const [pda, _nonce] = await PublicKey.findProgramAddress(
    [Buffer.from(utils.bytes.utf8.encode("modular"))],
    program.programId
  );

  const resourceAccount = await associatedAddress({
    mint: resource.address,
    owner: provider.wallet.publicKey,
  });
  console.log("resourceAccount");
  console.log(resourceAccount.toBase58());

  const accounts = {
    miner: provider.wallet.publicKey,
    resourceAccount,
    mint: resource.address,
    pda,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  console.log(Object.values(accounts).map((account) => account.toBase58()));

  await program.rpc.mine({
    accounts,
    signers: [wallet.payer],
  });
}

async function craftItem(environment: Environment, wallet: Wallet, item: Item) {
  const modular = getModularAddress(environment);
  if (!modular) {
    return;
  }

  const provider = await getProvider(environment, wallet);
  const program = new Program(idl as any, programID, provider);

  const [pda, _nonce] = await PublicKey.findProgramAddress(
    [Buffer.from(utils.bytes.utf8.encode("modular"))],
    program.programId
  );

  const crafterAccount = await associatedAddress({
    owner: provider.wallet.publicKey,
    mint: item.address,
  });

  let itemOne = web3.Keypair.generate().publicKey;
  let sourceOne = web3.Keypair.generate().publicKey;
  if (item.recipes[0].count > 0) {
    itemOne = item.recipes[0].item;
    sourceOne = await associatedAddress({
      owner: provider.wallet.publicKey,
      mint: item.recipes[0].item,
    });
  }

  let itemTwo = web3.Keypair.generate().publicKey;
  let sourceTwo = web3.Keypair.generate().publicKey;
  if (item.recipes[1].count > 0) {
    itemTwo = item.recipes[1].item;
    sourceTwo = await associatedAddress({
      owner: provider.wallet.publicKey,
      mint: item.recipes[1].item,
    });
  }

  let itemThree = web3.Keypair.generate().publicKey;
  let sourceThree = web3.Keypair.generate().publicKey;
  if (item.recipes[2].count > 0) {
    itemThree = item.recipes[2].item;
    sourceThree = await associatedAddress({
      owner: provider.wallet.publicKey,
      mint: item.recipes[2].item,
    });
  }

  const accounts = {
    crafter: provider.wallet.publicKey,
    crafterAccount,
    craftTarget: item.address,
    modular,
    pda,
    itemOne,
    itemTwo,
    itemThree,
    sourceOne,
    sourceTwo,
    sourceThree,
    tokenProgram: TOKEN_PROGRAM_ID,
  };
  console.log(accounts);

  await program.rpc.craftItem({
    accounts,
  });
}

async function getInventory(
  environment: Environment,
  wallet: Wallet,
  items: Item[]
) {
  const provider = await getProvider(environment, wallet);
  if (wallet && provider.wallet.publicKey) {
    return await Promise.all(
      items.map(async (item) => {
        const token = new Token(
          provider.connection,
          item.address,
          TOKEN_PROGRAM_ID,
          wallet.payer
        );
        console.log(token.publicKey);
        console.log(token.programId);
        return {
          address: item.address.toBase58(),
          account: await token.getOrCreateAssociatedAccountInfo(
            provider.wallet.publicKey
          ),
        };
      })
    ).then((accounts) =>
      accounts.filter((item) => item.account.amount.toNumber() > 0)
    );
  }
  return {};
}

export {
  Environment,
  getInventory,
  getModular,
  craftItem,
  mine,
  registerItem,
  registerResource,
  initModular,
};
