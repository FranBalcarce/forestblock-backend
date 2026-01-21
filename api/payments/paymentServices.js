const { Alchemy, Network } = require("alchemy-sdk");
const mongoose = require("mongoose");
const PaymentModel = require("./paymentModel");

const ENVIRONMENT = process.env.ENVIRONMENT || "development";

let network, tokenContractAddress;

if (ENVIRONMENT === "production") {
  network = Network.MATIC_MAINNET;
  tokenContractAddress =
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f".toLowerCase(); // USDT en Mainnet
} else {
  network = Network.ETH_SEPOLIA;
  tokenContractAddress =
    "0x779877A7B0D9E8603169DdbD7836e478b4624789".toLowerCase(); // LINK en Sepolia
}

const alchemyConfig = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: network,
};

const alchemy = new Alchemy(alchemyConfig);

const monitorSingleWallet = async (
  walletAddress,
  paymentId,
  expectedAmount
) => {
  console.log(`Iniciando monitoreo para la billetera: ${walletAddress}`);
  const MAX_MONITORING_TIME = 600000; // 10 minutos en milisegundos
  const INTERVAL_TIME = 5000; // 5 segundos en milisegundos
  const startTime = Date.now();
  let balance = 0; // Balance acumulado
  const processedTransactions = new Set(); // Registro de hashes procesados

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    console.error(`paymentId inválido: ${paymentId}`);
    return;
  }

  const interval = setInterval(async () => {
    try {
      // Calculamos el tiempo real transcurrido
      const elapsedTime = Date.now() - startTime;
      console.log(`Tiempo transcurrido: ${elapsedTime} ms`);

      // Si se supera el tiempo máximo, detener el monitoreo
      if (elapsedTime >= MAX_MONITORING_TIME) {
        console.log(
          `Tiempo máximo de monitoreo alcanzado para la billetera: ${walletAddress}`
        );
        clearInterval(interval);
        return;
      }

      const DECIMALS = 2;
      console.log("Realizando solicitud a Alchemy...");
      const response = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toAddress: walletAddress,
        contractAddresses: [tokenContractAddress],
        category: ["erc20"],
        excludeZeroValue: true,
      });

      if (response.transfers.length > 0) {
        console.log(`Transacciones detectadas: ${response.transfers.length}`);

        for (const transfer of response.transfers) {
          const transferAmount = parseFloat(transfer.value);
          const transferHash = transfer.hash;

          if (!processedTransactions.has(transferHash)) {
            processedTransactions.add(transferHash);

            if (!isNaN(transferAmount)) {
              balance += transferAmount;
              console.log(
                `Monto recibido: ${transferAmount}, Balance acumulado: ${balance}`
              );
            }

            // Actualizar el balance parcial en la base de datos
            await PaymentModel.findByIdAndUpdate(paymentId, {
              amountReceived: balance,
              updatedAt: new Date(),
            });
          }
        }

        const roundedBalance = parseFloat(balance.toFixed(DECIMALS));
        const roundedExpected = parseFloat(expectedAmount.toFixed(DECIMALS));

        if (roundedBalance >= roundedExpected) {
          console.log(
            `Pago confirmado para la billetera: ${walletAddress}. Balance final redondeado: ${roundedBalance}`
          );

          await PaymentModel.findByIdAndUpdate(paymentId, {
            status: "CONFIRMED",
            updatedAt: new Date(),
          });

          clearInterval(interval);
        } else {
          console.log(
            `Balance insuficiente para confirmar el pago. Se espera: ${roundedExpected}, Actual: ${roundedBalance}`
          );
        }
      } else {
        console.log("No se detectaron transacciones relevantes.");
      }
    } catch (error) {
      console.error(
        `Error al solicitar transacciones para la billetera ${walletAddress}:`,
        error
      );
    }
  }, INTERVAL_TIME);
};

module.exports = { monitorSingleWallet };
