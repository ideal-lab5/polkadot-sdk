// Assign a parachain to a core.
//
// First argument should be the parachain id.
// Second argument should be the core.
async function run(nodeName, networkInfo, args) {
  const { wsUri, userDefinedTypes } = networkInfo.nodesByName[nodeName];
  const api = await zombie.connect(wsUri, userDefinedTypes);

  let para = Number(args[0]);
  let core = Number(args[1]);
  console.log(`Assigning para ${para} to core ${core}`);

  await zombie.util.cryptoWaitReady();

  // Submit transaction with Alice accoung
  const keyring = new zombie.Keyring({ type: "sr25519" });
  const alice = keyring.addFromUri("//Alice");

  // Wait for this transaction to be finalized in a block.
  await new Promise(async (resolve, reject) => {
    const unsub = await api.tx.sudo
      .sudo(api.tx.coretime.assignCore(core, 0, [[{ task: para }, 57600]], null))
      .signAndSend(alice, ({ status, isError }) => {
        if (status.isInBlock) {
          console.log(
            `Transaction included at blockhash ${status.asInBlock}`,
          );
        } else if (status.isFinalized) {
          console.log(
            `Transaction finalized at blockHash ${status.asFinalized}`,
          );
          unsub();
          return resolve();
        } else if (isError) {
          console.log(`Transaction error`);
          reject(`Transaction error`);
        }
      });
  });



  return 0;
}

module.exports = { run };
