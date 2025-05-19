# Capital Cities Quiz

This game tests your geography knowledge about countries and their corresponding capitals.  A score between 0 and 5 is assigned to each trial.

The purpose of the game's website is to showcase generation of a zkPass token based on some "real" Web2 information (your score).

## Prerequisites

- Run the [zkPass server](https://github.com/zkFold/zkpass-cardano).
- Use section *Setup zkPass* of [zkPass DApp](https://github.com/zkFold/zkpass-client/) to execute initial setup.

## Game & zkPass instructions

- Start the *Capital Cities Quiz* website locally with
```shell
npm run dev
```
- Press `Generate Questions` to start a new quiz.  Answer with the number corresponding to the correct capital city.
- Press `Submit` go see your score.

### zkPass token

To mint the zkPass token that captures ("intercepts") your score, follow these steps:

1. Make sure you have entered the address receiving the minted token at the bottom of the page.  (Press `Self` to automatically enter your own address.)
2. Press `ZkPass Mint` to mint the *zkPass token*.

*Notes:*

- The *zkPass result* is the bytestring corresponding to your score.
- Token name is the hash of the *zkPass result*.
- The minted token can be used to claim a reward by burning the token using the [zkPass DApp](https://github.com/zkFold/zkpass-client/).  For burning to succeed, a reward needs to have been posted at the `ForwardingMint` address.
  - Use section *Transfer zkPass Reward* of the DApp to post a reward.
  - Use section *Burn zkPass Token & get reward* to burn token.  (Token field needs to be entered in the form *policyID.tokenName*.)
