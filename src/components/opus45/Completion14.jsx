import React, { useState, useRef, useEffect, useCallback } from 'react';
import SparkMD5 from 'spark-md5';

// MD5 hash function using SparkMD5
const md5 = (str) => SparkMD5.hash(str);

// Genesis block configuration
const GENESIS_BLOCK = {
  index: 0,
  timestamp: 1700000000000,
  transactions: [],
  previousHash: '0000000000000000000000000000000000000000',
  nonce: 0,
  hash: '0000000000000000000000000000000000000000',
};

// Mining difficulty (number of leading zeros required)
const DIFFICULTY = 4;
const DIFFICULTY_PREFIX = '0'.repeat(DIFFICULTY);

// Mining reward
const MINING_REWARD = 10;

// Create genesis block with proper hash
const createGenesisBlock = () => {
  const block = { ...GENESIS_BLOCK };
  block.hash = calculateHash(block);
  return block;
};

// Calculate block hash
const calculateHash = (block) => {
  const data = `${block.index}${block.timestamp}${JSON.stringify(block.transactions)}${block.previousHash}${block.nonce}`;
  return md5(data);
};

// Check if hash meets difficulty requirement
const isValidHash = (hash) => hash.startsWith(DIFFICULTY_PREFIX);

const Completion14 = () => {
  const [blockchain, setBlockchain] = useState([createGenesisBlock()]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [wallets] = useState({
    alice: { name: 'Alice', address: '0xalice00000000001', color: '#FF6B6B' },
    bob: { name: 'Bob', address: '0xbob0000000000002', color: '#4ECDC4' },
    miner: { name: 'Miner', address: '0xminer00000000003', color: '#FFE66D' },
  });
  const [selectedSender, setSelectedSender] = useState('alice');
  const [selectedReceiver, setSelectedReceiver] = useState('bob');
  const [amount, setAmount] = useState(5);
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState({ attempts: 0, currentHash: '' });
  const [logs, setLogs] = useState([]);
  const miningRef = useRef(false);
  const logContainerRef = useRef(null);

  // Add log entry
  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-50), { message, type, timestamp }]);
  }, []);

  // Scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Calculate balance for a wallet
  const getBalance = useCallback(
    (address) => {
      let balance = 0;
      for (const block of blockchain) {
        for (const tx of block.transactions) {
          if (tx.to === address) balance += tx.amount;
          if (tx.from === address) balance -= tx.amount;
        }
      }
      return balance;
    },
    [blockchain]
  );

  // Add transaction to pending pool
  const addTransaction = () => {
    const sender = wallets[selectedSender];
    const receiver = wallets[selectedReceiver];

    if (sender.address === receiver.address) {
      addLog('Cannot send to yourself!', 'error');
      return;
    }

    const senderBalance = getBalance(sender.address);
    if (senderBalance < amount) {
      addLog(`${sender.name} doesn't have enough 💡 (Balance: ${senderBalance})`, 'error');
      return;
    }

    const transaction = {
      id: Date.now(),
      from: sender.address,
      fromName: sender.name,
      to: receiver.address,
      toName: receiver.name,
      amount: amount,
      timestamp: Date.now(),
    };

    setPendingTransactions((prev) => [...prev, transaction]);
    addLog(`📝 Transaction: ${sender.name} → ${receiver.name}: ${amount} 💡`, 'transaction');
  };

  // Mine a new block
  const mineBlock = async () => {
    if (pendingTransactions.length === 0) {
      addLog('No pending transactions to mine!', 'error');
      return;
    }

    setIsMining(true);
    miningRef.current = true;
    addLog('⛏️ Mining started...', 'mining');

    const lastBlock = blockchain[blockchain.length - 1];
    const minerAddress = wallets.miner.address;

    // Add mining reward transaction
    const rewardTx = {
      id: Date.now(),
      from: 'COINBASE',
      fromName: 'Mining Reward',
      to: minerAddress,
      toName: 'Miner',
      amount: MINING_REWARD,
      timestamp: Date.now(),
    };

    const newBlock = {
      index: lastBlock.index + 1,
      timestamp: Date.now(),
      transactions: [...pendingTransactions, rewardTx],
      previousHash: lastBlock.hash,
      nonce: 0,
      hash: '',
    };

    let nonce = 0;
    let hash = '';
    const startTime = Date.now();

    // Mining loop with async breaks for UI updates
    const mine = async () => {
      const batchSize = 1000;

      while (miningRef.current) {
        for (let i = 0; i < batchSize && miningRef.current; i++) {
          newBlock.nonce = nonce;
          hash = calculateHash(newBlock);

          if (isValidHash(hash)) {
            newBlock.hash = hash;
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            setBlockchain((prev) => [...prev, newBlock]);
            setPendingTransactions([]);
            setIsMining(false);
            miningRef.current = false;

            addLog(`✅ Block #${newBlock.index} mined!`, 'success');
            addLog(`   Hash: ${hash}`, 'success');
            addLog(`   Nonce: ${nonce} | Time: ${duration}s`, 'success');
            addLog(`   Miner earned ${MINING_REWARD} 💡`, 'reward');
            return;
          }
          nonce++;
        }

        setMiningProgress({ attempts: nonce, currentHash: hash });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    };

    await mine();
  };

  // Stop mining
  const stopMining = () => {
    miningRef.current = false;
    setIsMining(false);
    addLog('⏹️ Mining stopped', 'info');
  };

  // Verify blockchain integrity
  const verifyBlockchain = () => {
    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const previousBlock = blockchain[i - 1];

      // Verify current block hash
      const calculatedHash = calculateHash(currentBlock);
      if (currentBlock.hash !== calculatedHash) {
        addLog(`❌ Block #${i} has invalid hash!`, 'error');
        return false;
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        addLog(`❌ Block #${i} has invalid previous hash link!`, 'error');
        return false;
      }

      // Verify hash difficulty
      if (!isValidHash(currentBlock.hash)) {
        addLog(`❌ Block #${i} doesn't meet difficulty requirement!`, 'error');
        return false;
      }
    }

    addLog('✅ Blockchain is valid!', 'success');
    return true;
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#eee',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '2.5rem',
      margin: '0',
      background: 'linear-gradient(90deg, #FFE66D, #FF6B6B)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 30px rgba(255, 230, 109, 0.3)',
    },
    subtitle: {
      color: '#888',
      fontSize: '0.9rem',
      marginTop: '5px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    cardTitle: {
      fontSize: '1.2rem',
      marginTop: '0',
      marginBottom: '15px',
      color: '#FFE66D',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    walletGrid: {
      display: 'grid',
      gap: '10px',
    },
    wallet: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '10px',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    walletInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    walletAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
    },
    walletName: {
      fontWeight: 'bold',
    },
    walletAddress: {
      fontSize: '0.75rem',
      color: '#888',
      fontFamily: 'monospace',
    },
    walletBalance: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    select: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontSize: '1rem',
      marginBottom: '10px',
      cursor: 'pointer',
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontSize: '1rem',
      marginBottom: '10px',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px',
    },
    primaryButton: {
      background: 'linear-gradient(90deg, #4ECDC4, #44A08D)',
      color: '#fff',
    },
    mineButton: {
      background: 'linear-gradient(90deg, #FFE66D, #F7B731)',
      color: '#1a1a2e',
    },
    stopButton: {
      background: 'linear-gradient(90deg, #FF6B6B, #EE5A24)',
      color: '#fff',
    },
    verifyButton: {
      background: 'linear-gradient(90deg, #6C5CE7, #A29BFE)',
      color: '#fff',
    },
    pendingTx: {
      background: 'rgba(255, 230, 109, 0.1)',
      borderRadius: '8px',
      padding: '10px',
      marginBottom: '8px',
      fontSize: '0.9rem',
    },
    blockchainContainer: {
      display: 'flex',
      overflowX: 'auto',
      gap: '15px',
      padding: '10px 0',
    },
    block: {
      minWidth: '200px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '10px',
      padding: '15px',
      position: 'relative',
    },
    blockHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    blockNumber: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#FFE66D',
    },
    blockHash: {
      fontSize: '0.7rem',
      fontFamily: 'monospace',
      color: '#4ECDC4',
      wordBreak: 'break-all',
      marginBottom: '8px',
    },
    blockTxCount: {
      fontSize: '0.8rem',
      color: '#888',
    },
    chainLink: {
      position: 'absolute',
      right: '-15px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1.5rem',
      color: '#FFE66D',
    },
    logContainer: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '10px',
      padding: '10px',
      height: '200px',
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
    },
    logEntry: {
      padding: '3px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    miningProgress: {
      background: 'rgba(255, 230, 109, 0.1)',
      borderRadius: '8px',
      padding: '15px',
      textAlign: 'center',
    },
    miningAttempts: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#FFE66D',
    },
    currentHash: {
      fontSize: '0.7rem',
      fontFamily: 'monospace',
      color: '#888',
      wordBreak: 'break-all',
      marginTop: '10px',
    },
    label: {
      fontSize: '0.9rem',
      color: '#888',
      marginBottom: '5px',
      display: 'block',
    },
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error':
        return '#FF6B6B';
      case 'success':
        return '#4ECDC4';
      case 'transaction':
        return '#A29BFE';
      case 'mining':
        return '#FFE66D';
      case 'reward':
        return '#F7B731';
      default:
        return '#888';
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>💡 Lightbulb Coin</h1>
        <p style={styles.subtitle}>
          A simple blockchain implementation using MD5 • Difficulty: {DIFFICULTY} zeros
        </p>
      </header>

      <div style={styles.grid}>
        {/* Wallets Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👛 Wallets</h2>
          <div style={styles.walletGrid}>
            {Object.entries(wallets).map(([key, wallet]) => (
              <div key={key} style={styles.wallet}>
                <div style={styles.walletInfo}>
                  <div style={{ ...styles.walletAvatar, background: wallet.color }}>
                    {wallet.name === 'Alice' ? '👩' : wallet.name === 'Bob' ? '👨' : '⛏️'}
                  </div>
                  <div>
                    <div style={styles.walletName}>{wallet.name}</div>
                    <div style={styles.walletAddress}>{wallet.address}</div>
                  </div>
                </div>
                <div style={{ ...styles.walletBalance, color: wallet.color }}>
                  {getBalance(wallet.address)} 💡
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send Transaction Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📤 Send Transaction</h2>
          <label style={styles.label}>From:</label>
          <select
            style={styles.select}
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
          >
            {Object.entries(wallets).map(([key, wallet]) => (
              <option key={key} value={key}>
                {wallet.name}
              </option>
            ))}
          </select>

          <label style={styles.label}>To:</label>
          <select
            style={styles.select}
            value={selectedReceiver}
            onChange={(e) => setSelectedReceiver(e.target.value)}
          >
            {Object.entries(wallets).map(([key, wallet]) => (
              <option key={key} value={key}>
                {wallet.name}
              </option>
            ))}
          </select>

          <label style={styles.label}>Amount (💡):</label>
          <input
            type="number"
            style={styles.input}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
          />

          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={addTransaction}
            disabled={isMining}
          >
            Add Transaction
          </button>
        </div>

        {/* Pending Transactions Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⏳ Pending Transactions ({pendingTransactions.length})</h2>
          {pendingTransactions.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center' }}>No pending transactions</p>
          ) : (
            pendingTransactions.map((tx) => (
              <div key={tx.id} style={styles.pendingTx}>
                <strong>{tx.fromName}</strong> → <strong>{tx.toName}</strong>: {tx.amount} 💡
              </div>
            ))
          )}
        </div>

        {/* Mining Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⛏️ Mining</h2>
          {isMining ? (
            <>
              <div style={styles.miningProgress}>
                <div style={styles.miningAttempts}>{miningProgress.attempts.toLocaleString()}</div>
                <div style={{ color: '#888' }}>hashes computed</div>
                <div style={styles.currentHash}>
                  Current: {miningProgress.currentHash || 'Starting...'}
                </div>
              </div>
              <button style={{ ...styles.button, ...styles.stopButton }} onClick={stopMining}>
                Stop Mining
              </button>
            </>
          ) : (
            <>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>
                Mining will find a nonce that produces a hash starting with {DIFFICULTY} zeros. The
                miner receives {MINING_REWARD} 💡 as reward.
              </p>
              <button
                style={{ ...styles.button, ...styles.mineButton }}
                onClick={mineBlock}
                disabled={pendingTransactions.length === 0}
              >
                Mine Block ⛏️
              </button>
            </>
          )}
          <button
            style={{ ...styles.button, ...styles.verifyButton }}
            onClick={verifyBlockchain}
            disabled={isMining}
          >
            Verify Blockchain ✓
          </button>
        </div>

        {/* Blockchain Visualization */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h2 style={styles.cardTitle}>⛓️ Blockchain ({blockchain.length} blocks)</h2>
          <div style={styles.blockchainContainer}>
            {blockchain.map((block, index) => (
              <div key={block.index} style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockNumber}>Block #{block.index}</span>
                  <span style={styles.blockTxCount}>{block.transactions.length} tx</span>
                </div>
                <div style={styles.blockHash}>Hash: {block.hash}</div>
                <div style={{ ...styles.blockHash, color: '#888' }}>
                  Prev: {block.previousHash.substring(0, 16)}...
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Nonce: {block.nonce}</div>
                {index < blockchain.length - 1 && <span style={styles.chainLink}>🔗</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h2 style={styles.cardTitle}>📋 Activity Log</h2>
          <div style={styles.logContainer} ref={logContainerRef}>
            {logs.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center' }}>
                No activity yet. Add a transaction and mine a block!
              </p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ ...styles.logEntry, color: getLogColor(log.type) }}>
                  [{log.timestamp}] {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion14;
