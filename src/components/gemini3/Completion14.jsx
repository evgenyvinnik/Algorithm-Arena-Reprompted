import React, { useState, useEffect, useRef } from 'react';

// --- Simple MD5 Implementation ---
// Source: https://github.com/blueimp/JavaScript-MD5 (Simplified for single file use)
const md5 = (string) => {
  const rotateLeft = (lValue, iShiftBits) => {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  };

  const addUnsigned = (lX, lY) => {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  };

  const F = (x, y, z) => (x & y) | (~x & z);
  const G = (x, y, z) => (x & z) | (y & ~z);
  const H = (x, y, z) => x ^ y ^ z;
  const I = (x, y, z) => y ^ (x | ~z);

  const FF = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  const GG = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  const HH = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  const II = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  const convertToWordArray = (string) => {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 =
      (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  const wordToHex = (lValue) => {
    let wordToHexValue = '',
      wordToHexValue_temp = '',
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue =
        wordToHexValue +
        wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  };

  const x = convertToWordArray(string);
  let k,
    AA,
    BB,
    CC,
    DD,
    a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476;

  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  const S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  const S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  const temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return temp.toLowerCase();
};

// --- Blockchain Constants & Helpers ---
const DIFFICULTY_PREFIX = '0000'; // Target hash prefix
const MINING_REWARD = 50;

const calculateHash = (index, previousHash, timestamp, transactions, nonce) => {
  return md5(
    index + previousHash + timestamp + JSON.stringify(transactions) + nonce
  );
};

const createGenesisBlock = () => {
  const timestamp = Date.now();
  const transactions = [];
  const nonce = 0; // Simplified for genesis
  // We'll just hardcode a genesis hash close enough or mine it quickly
  // For simplicity, let's just make a valid block manually if possible, or just mine it on init
  return {
    index: 0,
    previousHash: '0',
    timestamp,
    transactions,
    nonce,
    hash: calculateHash(0, '0', timestamp, transactions, nonce),
  };
};

const Completion14 = () => {
  const [blockchain, setBlockchain] = useState([createGenesisBlock()]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [wallets, setWallets] = useState({
    Alice: 100,
    Bob: 100,
    Miner: 0,
  });
  const [miningStatus, setMiningStatus] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // --- Actions ---

  const addTransaction = (sender, recipient, amount) => {
    if (wallets[sender] < amount) {
      alert(`Insufficient funds for ${sender}!`);
      return;
    }

    // Optimistic balance update for UI (in a real chain this happens after confirmation)
    // But for this demo, we'll deduct now to prevent double spend in pending pool easily
    setWallets(prev => ({
      ...prev,
      [sender]: prev[sender] - amount
    }));

    const newTx = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      sender,
      recipient,
      amount,
      timestamp: Date.now()
    };

    setPendingTransactions(prev => [...prev, newTx]);
  };

  const mineBlock = async () => {
    if (isMining) return;
    setIsMining(true);
    setMiningStatus('Preparing to mine...');

    // Use setTimeout to allow UI to render the "Mining..." state
    setTimeout(async () => {
      const lastBlock = blockchain[blockchain.length - 1];
      const index = lastBlock.index + 1;
      const previousHash = lastBlock.hash;
      const timestamp = Date.now();
      const transactions = [...pendingTransactions];

      // Add mining reward transaction
      const rewardTx = {
        id: 'reward-' + Date.now(),
        sender: 'System',
        recipient: 'Miner',
        amount: MINING_REWARD,
        timestamp: Date.now(),
        type: 'reward'
      };
      transactions.push(rewardTx);

      let nonce = 0;
      let hash = calculateHash(index, previousHash, timestamp, transactions, nonce);

      setMiningStatus('Mining... This may take a moment.');

      // Simple mining loop
      // We break it into chunks if needed, but '0000' on MD5 is usually fast enough
      const mine = () => {
        const startTime = Date.now();
        while (hash.substring(0, DIFFICULTY_PREFIX.length) !== DIFFICULTY_PREFIX) {
          nonce++;
          hash = calculateHash(index, previousHash, timestamp, transactions, nonce);

          // Safety break to prevent complete freeze if it takes too long (rare for MD5/0000)
          if (Date.now() - startTime > 500) {
            setMiningStatus(`Mining... Nonce: ${nonce}`);
            setTimeout(mine, 0);
            return;
          }
        }

        // Block mined!
        const newBlock = {
          index,
          previousHash,
          timestamp,
          transactions,
          nonce,
          hash
        };

        setBlockchain(prev => [...prev, newBlock]);
        setPendingTransactions([]);

        // Update Miner balance (and recipients of pending txs)
        setWallets(prev => {
          const newWallets = { ...prev };

          // Credit recipients
          transactions.forEach(tx => {
            if (newWallets[tx.recipient] !== undefined) {
              newWallets[tx.recipient] += tx.amount;
            } else {
              // Create new wallet if recipient doesn't exist? For now just ignore or add
              newWallets[tx.recipient] = (newWallets[tx.recipient] || 0) + tx.amount;
            }
          });

          return newWallets;
        });

        setIsMining(false);
        setMiningStatus(`Block #${index} Mined! hash: ${hash.substring(0, 10)}...`);
        setTimeout(() => setMiningStatus(''), 3000);
      };

      mine();

    }, 100);
  };

  const validateChain = () => {
    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const previousBlock = blockchain[i - 1];

      if (currentBlock.hash !== calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.transactions, currentBlock.nonce)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  };

  const isChainValid = validateChain();

  return (
    <div style={{
      padding: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      background: '#f0f2f5',
      minHeight: '100vh',
      color: '#333'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>💡 Lightbulb Coin</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        A simple MD5-based blockchain implementation.
        <br />
        Current Difficulty: <strong>{DIFFICULTY_PREFIX}</strong>
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Wallet Dashboard */}
        <div style={cardStyle}>
          <h3>💰 Wallets</h3>
          {Object.entries(wallets).map(([name, balance]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>{name}</strong>
              <span>{balance} 💡</span>
            </div>
          ))}
        </div>

        {/* Transaction Form */}
        <div style={cardStyle}>
          <h3>💸 Make Transaction</h3>
          <TransactionForm
            wallets={Object.keys(wallets).filter(w => w !== 'Miner')} // Miner usually just receives
            onSubmit={addTransaction}
            disabled={isMining}
          />
        </div>

        {/* Pending Transactions */}
        <div style={{ ...cardStyle, flex: 1, minWidth: '300px' }}>
          <h3>⏳ Pending ({pendingTransactions.length})</h3>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {pendingTransactions.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No pending transactions</p>
            ) : (
              pendingTransactions.map(tx => (
                <div key={tx.id} style={{ fontSize: '14px', marginBottom: '5px' }}>
                  {tx.sender} ➝ {tx.recipient}: <strong>{tx.amount} 💡</strong>
                </div>
              ))
            )}
          </div>
          <button
            onClick={mineBlock}
            disabled={isMining || pendingTransactions.length === 0}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '10px',
              background: isMining ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isMining ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {isMining ? '⛏️ Mining...' : '⛏️ Mine Transactions'}
          </button>
          {miningStatus && <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>{miningStatus}</div>}
        </div>
      </div>

      {/* Blockchain Display */}
      <h2 style={{ marginTop: '50px', marginLeft: '10px' }}>
        🔗 Blockchain
        {!isChainValid && <span style={{ color: 'red', fontSize: '16px', marginLeft: '10px' }}>(Warning: Chain Invalid!)</span>}
      </h2>
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '20px 10px',
        gap: '20px',
        alignItems: 'center'
      }}>
        {blockchain.map((block, i) => (
          <React.Fragment key={block.hash}>
            <div
              onClick={() => setSelectedBlock(block)}
              style={{
                minWidth: '200px',
                background: selectedBlock === block ? '#e3f2fd' : 'white',
                border: selectedBlock === block ? '2px solid #2196F3' : '1px solid #ddd',
                borderRadius: '10px',
                padding: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>
                Block #{block.index}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <div>Nonce: {block.nonce}</div>
                <div>Hash: <span style={{ fontFamily: 'monospace' }}>{block.hash.substring(0, 8)}...</span></div>
                <div>Txns: {block.transactions.length}</div>
              </div>
            </div>
            {i < blockchain.length - 1 && (
              <div style={{ fontSize: '24px', color: '#ccc' }}>➜</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Selected Block Details */}
      {selectedBlock && (
        <div style={{ ...cardStyle, marginTop: '20px', width: '100%', boxSizing: 'border-box' }}>
          <h3>📦 Block #{selectedBlock.index} Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', fontSize: '14px' }}>
            <strong>Hash:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedBlock.hash}</span>
            <strong>Prev Hash:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedBlock.previousHash}</span>
            <strong>Nonce:</strong> <span>{selectedBlock.nonce}</span>
            <strong>Timestamp:</strong> <span>{new Date(selectedBlock.timestamp).toLocaleString()}</span>
          </div>

          <h4 style={{ marginTop: '20px' }}>Transactions</h4>
          {selectedBlock.transactions.length === 0 ? (
            <p>No transactions (Genesis block)</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>From</th>
                  <th style={{ padding: '8px' }}>To</th>
                  <th style={{ padding: '8px' }}>Amount</th>
                  <th style={{ padding: '8px' }}>ID</th>
                </tr>
              </thead>
              <tbody>
                {selectedBlock.transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{tx.sender}</td>
                    <td style={{ padding: '8px' }}>{tx.recipient}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: tx.type === 'reward' ? '#2196F3' : 'inherit' }}>
                      {tx.type === 'reward' ? '+' : ''}{tx.amount} 💡
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', color: '#888' }}>{tx.id.toString().substring(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// --- Subcomponent: Transaction Form ---
const TransactionForm = ({ wallets, onSubmit, disabled }) => {
  const [sender, setSender] = useState(wallets[0] || 'Alice');
  const [recipient, setRecipient] = useState('Bob');
  const [amount, setAmount] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sender === recipient) {
      alert("Cannot send to self!");
      return;
    }
    onSubmit(sender, recipient, Number(amount));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <select
        value={sender}
        onChange={e => setSender(e.target.value)}
        style={inputStyle}
        disabled={disabled}
      >
        {wallets.map(w => <option key={w} value={w}>From: {w}</option>)}
      </select>

      <select
        value={recipient}
        onChange={e => setRecipient(e.target.value)} // Simplified: assume can send to anyone in wallet list or Miner
        style={inputStyle}
        disabled={disabled}
      >
        {['Alice', 'Bob', 'Miner', 'Charlie'].map(w => <option key={w} value={w}>To: {w}</option>)}
      </select>

      <input
        type="number"
        min="1"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount"
        style={inputStyle}
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled}
        style={{
          padding: '10px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: disabled ? 'default' : 'pointer',
          marginTop: '5px'
        }}
      >
        Send Coins
      </button>
    </form>
  );
};

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  width: '300px'
};

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ddd'
};

export default Completion14;
