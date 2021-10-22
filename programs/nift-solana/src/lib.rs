use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, InitializeMint, MintTo, SetAuthority, Transfer};
declare_id!("7jpnzC3ZyPCX93ymm4zq3ePV6YBJMPiBZueieUC8jnnt");

#[program]
mod modular {
    use super::*;

    const MODULAR_PDA_SEED: &[u8] = b"modular";

    pub fn initialize_modular(ctx: Context<InitializeModular>) -> ProgramResult {
        Ok(())
    }

    pub fn register_item(
        ctx: Context<RegisterItem>,
        name: String,
        recipe_counts: [u8; 3],
    ) -> ProgramResult {
        let (pda, _bump_seed) = Pubkey::find_program_address(&[MODULAR_PDA_SEED], ctx.program_id);
        token::set_authority(
            CpiContext::new(
                ctx.accounts.item_mint.clone(),
                SetAuthority {
                    account_or_mint: ctx.accounts.item_mint.clone(),
                    current_authority: ctx.accounts.miner.clone(),
                },
            ),
            spl_token::instruction::AuthorityType::MintTokens,
            Some(pda),
        )?;
        let recipes = [
            Recipe {
                item: ctx.accounts.item_one.key(),
                count: recipe_counts[0],
            },
            Recipe {
                item: ctx.accounts.item_two.key(),
                count: recipe_counts[1],
            },
            Recipe {
                item: ctx.accounts.item_three.key(),
                count: recipe_counts[2],
            },
        ];
        let mut modular = ctx.accounts.modular.load_mut()?;
        modular.add_item({
            let src = name.as_bytes();
            let mut data = [0u8; 280];
            data[..src.len()].copy_from_slice(src);
            Item {
                address: ctx.accounts.item_mint.key(),
                name: data,
                recipes,
            }
        });
        Ok(())
    }

    pub fn craft_item(ctx: Context<CraftItem>) -> ProgramResult {
        let (_pda, bump_seed) = Pubkey::find_program_address(&[MODULAR_PDA_SEED], ctx.program_id);
        let seeds = &[&MODULAR_PDA_SEED[..], &[bump_seed]];
        let modular = ctx.accounts.modular.load()?;
        let tokens: [AccountInfo; 3] = [
            ctx.accounts.item_one.clone(),
            ctx.accounts.item_two.clone(),
            ctx.accounts.item_three.clone(),
        ];
        let source_accounts = [
            ctx.accounts.source_one.clone(),
            ctx.accounts.source_two.clone(),
            ctx.accounts.source_three.clone(),
        ];
        for item in modular.items.iter() {
            if item.address == ctx.accounts.craft_target.key() {
                for i in 0usize..3 {
                    let count = item.recipes[i].clone().count;
                    let source = source_accounts[i].clone();
                    if count > 0 {
                        token::burn(
                            CpiContext::new(
                                ctx.accounts.token_program.clone(),
                                Burn {
                                    mint: tokens[i].clone(),
                                    to: source,
                                    authority: ctx.accounts.crafter.clone(),
                                },
                            ),
                            count.into(),
                        )?
                    }
                }
            }
        }

        let cpi_accounts = MintTo {
            to: ctx.accounts.crafter_account.clone(),
            authority: ctx.accounts.pda.clone(),
            mint: ctx.accounts.craft_target.clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        token::mint_to(
            CpiContext::new(cpi_program, cpi_accounts).with_signer(&[&seeds[..]]),
            1,
        )?;

        Ok(())
    }

    pub fn register_resource(
        ctx: Context<RegisterMint>,
        name: String,
        rarity: u8,
    ) -> ProgramResult {
        let (pda, _bump_seed) = Pubkey::find_program_address(&[MODULAR_PDA_SEED], ctx.program_id);
        token::set_authority(
            ctx.accounts.into(),
            spl_token::instruction::AuthorityType::MintTokens,
            Some(pda),
        )?;
        let mut modular = ctx.accounts.modular.load_mut()?;
        modular.add_resource({
            let src = name.as_bytes();
            let mut data = [0u8; 280];
            data[..src.len()].copy_from_slice(src);
            Resource {
                address: ctx.accounts.mint.key(),
                name: data,
                rarity,
            }
        });
        Ok(())
    }

    pub fn mine(ctx: Context<Mine>) -> ProgramResult {
        let (_pda, bump_seed) = Pubkey::find_program_address(&[MODULAR_PDA_SEED], ctx.program_id);
        let cpi_accounts = MintTo {
            to: ctx.accounts.resource_account.clone(),
            authority: ctx.accounts.pda.clone(),
            mint: ctx.accounts.mint.clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let seeds = &[&MODULAR_PDA_SEED[..], &[bump_seed]];
        token::mint_to(
            CpiContext::new(cpi_program, cpi_accounts).with_signer(&[&seeds[..]]),
            2,
        )
    }
}

// Transaction instructions
#[derive(Accounts)]
pub struct InitializeModular<'info> {
    #[account(zero)]
    modular: Loader<'info, Modular>,
}

// Transaction instructions
#[derive(Accounts)]
pub struct RegisterItem<'info> {
    #[account(signer)]
    pub miner: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    #[account(mut)]
    pub modular: Loader<'info, Modular>,
    #[account(mut)]
    pub item_mint: AccountInfo<'info>,
    #[account(mut)]
    pub item_one: AccountInfo<'info>,
    #[account(mut)]
    pub item_two: AccountInfo<'info>,
    #[account(mut)]
    pub item_three: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CraftItem<'info> {
    #[account(signer)]
    pub crafter: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    #[account(mut)]
    pub pda: AccountInfo<'info>,
    #[account(mut)]
    pub crafter_account: AccountInfo<'info>,
    #[account(mut)]
    pub modular: Loader<'info, Modular>,
    #[account(mut)]
    pub item_one: AccountInfo<'info>,
    #[account(mut)]
    pub item_two: AccountInfo<'info>,
    #[account(mut)]
    pub item_three: AccountInfo<'info>,
    #[account(mut)]
    pub source_one: AccountInfo<'info>,
    #[account(mut)]
    pub source_two: AccountInfo<'info>,
    #[account(mut)]
    pub source_three: AccountInfo<'info>,
    #[account(mut)]
    pub craft_target: AccountInfo<'info>,
}

// Transaction instructions
#[derive(Accounts)]
pub struct RegisterMint<'info> {
    #[account(signer)]
    pub miner: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    #[account(mut)]
    pub modular: Loader<'info, Modular>,
    #[account(mut)]
    pub mint: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Mine<'info> {
    #[account(signer)]
    pub miner: AccountInfo<'info>,
    #[account(mut)]
    pub resource_account: AccountInfo<'info>,
    pub pda: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    #[account(mut)]
    pub mint: AccountInfo<'info>,
}

#[zero_copy]
pub struct Resource {
    address: Pubkey,
    name: [u8; 280],
    rarity: u8,
}

#[zero_copy]
pub struct Recipe {
    item: Pubkey,
    count: u8,
}

#[zero_copy]
pub struct Item {
    name: [u8; 280],
    recipes: [Recipe; 3],
    address: Pubkey,
}

#[account(zero_copy)]
pub struct Modular {
    resources: [Resource; 10], // Leaves the account at 10,485,680 bytes.
    items: [Item; 1000],       // Leaves the account at 10,485,680 bytes.
    items_count: i16,
    resources_count: i16,
}

impl Modular {
    fn add_resource(&mut self, resource: Resource) {
        if self.resources_count == 10 {
            return;
        }
        self.resources[Modular::index_of(self.resources_count)] = resource;
        self.resources_count += 1;
    }

    fn add_item(&mut self, item: Item) {
        if self.items_count == 1000 {
            return;
        }
        self.items[Modular::index_of(self.items_count)] = item;
        self.items_count += 1;
    }

    fn index_of(counter: i16) -> usize {
        std::convert::TryInto::try_into(counter % 1000).unwrap()
    }
}

impl<'a, 'b, 'c, 'info> From<&mut RegisterMint<'info>>
for CpiContext<'a, 'b, 'c, 'info, SetAuthority<'info>>
{
    fn from(
        accounts: &mut RegisterMint<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: accounts.mint.clone(),
            current_authority: accounts.miner.clone(),
        };
        let cpi_program = accounts.token_program.clone();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}
