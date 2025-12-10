import React, { useState, useEffect } from "react";
import pako from "pako";

// Utility functions for encryption/decryption
const generateKey = async () => {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

const exportKey = async (key) => {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

const importKey = async (keyString) => {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

const encrypt = async (data, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));

  // Compress the data
  const compressed = pako.deflate(encoded);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    compressed
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
};

const decrypt = async (encryptedData, key) => {
  const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Decompress the data
  const decompressed = pako.inflate(new Uint8Array(decrypted));
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decompressed));
};

// Generate a random avatar color based on username
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString();
};

const Completion4 = () => {
  const [thread, setThread] = useState([]);
  const [newPost, setNewPost] = useState("");
  // Initialize username from localStorage synchronously
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("encrypted-thread-username") || "";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [urlLength, setUrlLength] = useState(0);
  const [copied, setCopied] = useState(false);

  // Load thread from URL on mount
  useEffect(() => {
    const loadThread = async () => {
      try {
        const hash = window.location.hash.slice(1);
        if (hash) {
          const [encryptedData, keyString] = hash.split(".");
          if (encryptedData && keyString) {
            const key = await importKey(keyString);
            setEncryptionKey(key);
            const decryptedThread = await decrypt(encryptedData, key);
            setThread(decryptedThread);
          }
        } else {
          // Generate new key for new thread
          const key = await generateKey();
          setEncryptionKey(key);
        }
      } catch (err) {
        console.error("Failed to load thread:", err);
        setError("Failed to decrypt thread. The link may be corrupted.");
        const key = await generateKey();
        setEncryptionKey(key);
      }
      setIsLoading(false);
    };

    loadThread();
  }, []);

  // Update URL when thread changes - use ref to avoid lint warning
  const updateUrlRef = React.useRef(null);

  useEffect(() => {
    updateUrlRef.current = async (newThread) => {
      if (!encryptionKey || newThread.length === 0) {
        setShareUrl("");
        setUrlLength(0);
        return;
      }

      try {
        const encryptedData = await encrypt(newThread, encryptionKey);
        const keyString = await exportKey(encryptionKey);
        const hash = `${encryptedData}.${keyString}`;
        const url = `${window.location.origin}${window.location.pathname}#${hash}`;

        setShareUrl(url);
        setUrlLength(hash.length);

        // Update browser URL without reload
        window.history.replaceState(null, "", `#${hash}`);
      } catch (err) {
        console.error("Failed to update URL:", err);
      }
    };
  }, [encryptionKey]);

  useEffect(() => {
    if (updateUrlRef.current) {
      updateUrlRef.current(thread);
    }
  }, [thread, encryptionKey]);

  const handlePost = async () => {
    if (!newPost.trim() || !username.trim()) return;

    const post = {
      id: Date.now(),
      author: username.trim(),
      content: newPost.trim(),
      timestamp: Date.now(),
      likes: 0,
    };

    const updatedThread = [...thread, post];
    setThread(updatedThread);
    setNewPost("");

    // Save username
    localStorage.setItem("encrypted-thread-username", username.trim());
  };

  const handleLike = (postId) => {
    setThread(
      thread.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleCopyUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewThread = async () => {
    const key = await generateKey();
    setEncryptionKey(key);
    setThread([]);
    setShareUrl("");
    setUrlLength(0);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      color: "#fff",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
      padding: "20px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "16px",
      backdropFilter: "blur(10px)",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      margin: "0 0 10px 0",
      background: "linear-gradient(90deg, #00d2ff, #3a7bd5)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      fontSize: "14px",
      color: "#888",
      margin: "0",
    },
    urlInfo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginTop: "15px",
      padding: "10px",
      background:
        urlLength > 1800 ? "rgba(255,100,100,0.2)" : "rgba(0,200,100,0.2)",
      borderRadius: "8px",
      fontSize: "12px",
    },
    shareButton: {
      padding: "8px 16px",
      background: copied
        ? "#22c55e"
        : "linear-gradient(90deg, #00d2ff, #3a7bd5)",
      border: "none",
      borderRadius: "20px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
    },
    newThreadButton: {
      padding: "8px 16px",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "20px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "12px",
      marginLeft: "10px",
    },
    composer: {
      background: "rgba(255,255,255,0.05)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "20px",
      backdropFilter: "blur(10px)",
    },
    inputGroup: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      fontSize: "12px",
      color: "#888",
      marginBottom: "5px",
    },
    usernameInput: {
      width: "100%",
      padding: "12px 16px",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      padding: "16px",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "16px",
      resize: "none",
      outline: "none",
      fontFamily: "inherit",
      minHeight: "80px",
      boxSizing: "border-box",
    },
    postButton: {
      width: "100%",
      padding: "14px",
      background:
        !newPost.trim() || !username.trim()
          ? "rgba(255,255,255,0.1)"
          : "linear-gradient(90deg, #00d2ff, #3a7bd5)",
      border: "none",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: !newPost.trim() || !username.trim() ? "not-allowed" : "pointer",
      transition: "all 0.3s ease",
    },
    threadContainer: {
      position: "relative",
    },
    threadLine: {
      position: "absolute",
      left: "30px",
      top: "60px",
      bottom: "60px",
      width: "2px",
      background: "rgba(255,255,255,0.1)",
    },
    post: {
      background: "rgba(255,255,255,0.05)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
      backdropFilter: "blur(10px)",
      position: "relative",
    },
    postHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "12px",
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "18px",
      marginRight: "12px",
    },
    authorInfo: {
      flex: 1,
    },
    authorName: {
      fontWeight: "bold",
      fontSize: "15px",
    },
    timestamp: {
      fontSize: "12px",
      color: "#888",
    },
    content: {
      fontSize: "16px",
      lineHeight: "1.5",
      marginBottom: "12px",
      wordBreak: "break-word",
    },
    actions: {
      display: "flex",
      gap: "20px",
    },
    actionButton: {
      background: "none",
      border: "none",
      color: "#888",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "14px",
      padding: "8px 12px",
      borderRadius: "20px",
      transition: "all 0.2s ease",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#888",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
    errorMessage: {
      background: "rgba(255,100,100,0.2)",
      padding: "16px",
      borderRadius: "12px",
      marginBottom: "20px",
      textAlign: "center",
      color: "#ff6b6b",
    },
    encryptionBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      background: "rgba(34, 197, 94, 0.2)",
      borderRadius: "20px",
      fontSize: "12px",
      color: "#22c55e",
      marginTop: "10px",
    },
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>🔐</div>
          <div>Decrypting thread...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔐 Encrypted Thread</h1>
        <p style={styles.subtitle}>
          End-to-end encrypted conversations. Everything lives in the URL.
        </p>
        <div style={styles.encryptionBadge}>
          <span>🔒</span>
          <span>AES-256-GCM Encrypted</span>
        </div>

        {thread.length > 0 && (
          <div style={styles.urlInfo}>
            <span>URL Hash: {urlLength}/2000 characters</span>
            <button
              style={styles.shareButton}
              onClick={handleCopyUrl}
              disabled={!shareUrl}
            >
              {copied ? "✓ Copied!" : "📋 Copy Link"}
            </button>
            <button style={styles.newThreadButton} onClick={handleNewThread}>
              + New Thread
            </button>
          </div>
        )}
      </div>

      {error && <div style={styles.errorMessage}>⚠️ {error}</div>}

      {/* Composer */}
      <div style={styles.composer}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Your Name</label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.usernameInput}
            maxLength={30}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Message</label>
          <textarea
            placeholder="What's happening?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            style={styles.textarea}
            maxLength={280}
          />
          <div
            style={{
              fontSize: "12px",
              color: "#888",
              textAlign: "right",
              marginTop: "4px",
            }}
          >
            {newPost.length}/280
          </div>
        </div>
        <button
          onClick={handlePost}
          style={styles.postButton}
          disabled={!newPost.trim() || !username.trim()}
        >
          {thread.length === 0 ? "Start Thread" : "Reply"}
        </button>
      </div>

      {/* Thread */}
      {thread.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <h3>Start a new encrypted thread</h3>
          <p>
            Your messages will be encrypted and stored entirely in the URL.
            <br />
            Share the link to let others join the conversation!
          </p>
        </div>
      ) : (
        <div style={styles.threadContainer}>
          {thread.length > 1 && <div style={styles.threadLine} />}
          {thread.map((post, index) => (
            <div key={post.id} style={styles.post}>
              <div style={styles.postHeader}>
                <div
                  style={{
                    ...styles.avatar,
                    background: getAvatarColor(post.author),
                  }}
                >
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div style={styles.authorInfo}>
                  <div style={styles.authorName}>{post.author}</div>
                  <div style={styles.timestamp}>
                    {formatTime(post.timestamp)}
                  </div>
                </div>
                {index === 0 && (
                  <span
                    style={{
                      fontSize: "10px",
                      background: "rgba(0,210,255,0.2)",
                      padding: "4px 8px",
                      borderRadius: "10px",
                      color: "#00d2ff",
                    }}
                  >
                    OP
                  </span>
                )}
              </div>
              <div style={styles.content}>{post.content}</div>
              <div style={styles.actions}>
                <button
                  style={{
                    ...styles.actionButton,
                    color: post.likes > 0 ? "#f91880" : "#888",
                  }}
                  onClick={() => handleLike(post.id)}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "rgba(249,24,128,0.1)")
                  }
                  onMouseLeave={(e) => (e.target.style.background = "none")}
                >
                  <span>{post.likes > 0 ? "❤️" : "🤍"}</span>
                  {post.likes > 0 && post.likes}
                </button>
                <span style={{ ...styles.actionButton, cursor: "default" }}>
                  <span>💬</span>
                  {index === thread.length - 1
                    ? "Latest"
                    : `Reply ${index + 1}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "#666",
          fontSize: "12px",
          marginTop: "20px",
        }}
      >
        <p>🔐 All data is encrypted client-side using AES-256-GCM</p>
        <p>📦 Messages are compressed with DEFLATE algorithm</p>
        <p>🔗 No server storage - everything lives in the URL</p>
      </div>
    </div>
  );
};

export default Completion4;
