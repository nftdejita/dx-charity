import "./styles.css";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import charityArtifact from "./Charity.json";

const CHARITY_CONTRACT_ADDRESS = "0x0668a389677109304a988ed27d550d58e1e1e28d"; // スマートコントラクトのアドレスを入力してください。

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [charityContract, setCharityContract] = useState(null);
  const [logs, setLogs] = useState([]); // 新しいstate変数 logs
  const [balance, setBalance] = useState(0); // 新しいstate変数 balance

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const contract = new web3Instance.eth.Contract(
          charityArtifact.abi,
          CHARITY_CONTRACT_ADDRESS
        );
        setCharityContract(contract);
      } else {
        console.error("Metamask not detected");
      }
    };

    initWeb3();

    fetchBalance(); // 募金額を取得
  }, [web3, charityContract]);

  const addLog = (message, isError = false) => {
    setLogs((prevLogs) => [...prevLogs, { text: message, error: isError }]);
  };

  const donate = async () => {
    if (!web3 || !charityContract) return;

    try {
      // アカウントへのアクセス許可を要求
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // 選択されたアカウントのアドレスを取得
      const selectedAccount = window.ethereum.selectedAddress;

      const amount = web3.utils.toWei("0.1", "ether");

      await charityContract.methods
        .donate()
        .send({ from: selectedAccount, value: amount })
        .on("transactionHash", (hash) => {
          addLog(`Donation transaction hash: ${hash}`);
        });
    } catch (error) {
      addLog(`Error: ${error.message}`, true);
    }
  };

  const withdraw = async () => {
    if (!web3 || !charityContract) return;

    const accounts = await web3.eth.getAccounts();

    charityContract.methods
      .withdraw()
      .send({ from: accounts[0] })
      .on("transactionHash", (hash) => {
        console.log("Withdraw transaction hash:", hash);
      })
      .on("error", (error) => {
        console.error("Error:", error);
      });
  };

  const fetchBalance = async () => {
    if (!web3 || !charityContract) return;

    const balanceWei = await web3.eth.getBalance(
      charityContract.options.address
    );
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    setBalance(balanceEth);
  };

  return (
    <div className="App">
      <h1>Charity App</h1>
      <h2>Current balance: {balance} ETH</h2> {/* 募金額を表示 */}
      <button onClick={donate}>Donate 0.1 Ether</button>
      <button onClick={withdraw}>Withdraw</button>
      <div className="logs">
        {logs.map((log, index) => (
          <p key={index} className={log.error ? "error" : ""}>
            {log.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default App;
