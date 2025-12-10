import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// --- Crypto & Compression Helpers ---

const generateKey = async () => {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

const exportKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(exported);
};

const importKey = async (jwkString) => {
  const jwk = JSON.parse(jwkString);
  return window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

const compress = async (string) => {
  const stream = new Blob([string]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
  const response = await new Response(compressedStream);
  const blob = await response.blob();
  return new Uint8Array(await blob.arrayBuffer());
};

const decompress = async (bytes) => {
  const stream = new Blob([bytes]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
  const response = await new Response(decompressedStream);
  return await response.text();
};

const encrypt = async (data, key) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedContent), iv.length);
  return combined;
};

const decrypt = async (data, key) => {
  const iv = data.slice(0, 12);
  const encryptedContent = data.slice(12);
  const decryptedContent = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedContent
  );
  return new TextDecoder().decode(decryptedContent);
};

const bytesToBase64 = (bytes) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToBytes = (base64) => {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// --- Components ---

const ThreadNode = ({ node, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    onReply(node.id, replyContent, replyAuthor);
    setIsReplying(false);
    setReplyContent('');
    setReplyAuthor('');
  };

  return (
    <div style={{ 
      borderLeft: '2px solid #ccc', 
      paddingLeft: '15px', 
      marginTop: '10px',
      marginBottom: '10px'
    }}>
      <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{node.author}</div>
        <div style={{ marginBottom: '10px' }}>{node.content}</div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>{new Date(node.timestamp).toLocaleString()}</div>
        <button 
          onClick={() => setIsReplying(!isReplying)}
          style={{ marginTop: '5px', fontSize: '0.8em', cursor: 'pointer' }}
        >
          {isReplying ? 'Cancel' : 'Reply'}
        </button>
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Your Name"
            value={replyAuthor}
            onChange={(e) => setReplyAuthor(e.target.value)}
            required
            style={{ display: 'block', marginBottom: '5px', width: '100%', padding: '5px' }}
          />
          <textarea
            placeholder="Reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
            style={{ display: 'block', marginBottom: '5px', width: '100%', padding: '5px' }}
          />
          <button type="submit">Post Reply</button>
        </form>
      )}

      {node.replies && node.replies.map(reply => (
        <ThreadNode key={reply.id} node={reply} onReply={onReply} />
      ))}
    </div>
  );
};

const Completion4 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [thread, setThread] = useState(null);
  const [key, setKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadAuthor, setNewThreadAuthor] = useState('');

  // Initialize: Check URL params
  useEffect(() => {
    const init = async () => {
      try {
        const dataParam = searchParams.get('data');
        
        if (!dataParam) {
          // No data, start fresh
          const newKey = await generateKey();
          setKey(newKey);
          setThread([]);
          setLoading(false);
          return;
        }

        // Format: keyJWK|encryptedData
        const parts = dataParam.split('|');
        if (parts.length !== 2) {
          throw new Error("Invalid URL format");
        }

        // Decode key
        // Note: URL encoding might have replaced + with space or similar, but searchParams handles decoding.
        // However, base64 might need care.
        const keyStr = atob(parts[0]);
        const loadedKey = await importKey(keyStr);
        setKey(loadedKey);

        // Decode data
        const encryptedBytes = base64ToBytes(parts[1]);
        
        // Decrypt
        const iv = encryptedBytes.slice(0, 12);
        const ciphertext = encryptedBytes.slice(12);
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          loadedKey,
          ciphertext
        );
        
        // Decompress
        const jsonString = await decompress(decryptedBuffer);
        setThread(JSON.parse(jsonString));
        setLoading(false);

      } catch (err) {
        console.error("Failed to load thread:", err);
        setError("Failed to load thread. The URL might be corrupted.");
        setLoading(false);
        // Fallback to new thread
        const newKey = await generateKey();
        setKey(newKey);
        setThread([]);
      }
    };

    init();
  }, []); // Run once on mount. 
  // Note: If URL changes externally (back button), we might need to listen to it.
  // But for now, let's assume simple flow. 
  // Actually, searchParams change should trigger re-init if we put it in dependency?
  // But init sets state, which might cause loops if we are not careful.
  // Let's keep it simple: Load once. If user navigates back, the component remounts.

  // Update URL when thread changes
  const updateUrl = useCallback(async (newThread, currentKey) => {
    if (!currentKey) return;

    try {
      const jsonString = JSON.stringify(newThread);
      const compressedBytes = await compress(jsonString);
      
      // Encrypt
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        currentKey,
        compressedBytes
      );
      
      const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedContent), iv.length);
      
      const encryptedBase64 = bytesToBase64(combined);
      const keyJson = await exportKey(currentKey);
      const keyBase64 = btoa(keyJson);
      
      const dataString = `${keyBase64}|${encryptedBase64}`;
      setSearchParams({ data: dataString });
      
    } catch (e) {
      console.error("Failed to update URL:", e);
      setError("Failed to save changes to URL. Data might be too large.");
    }
  }, [setSearchParams]);

  const addPost = (content, author) => {
    const newPost = {
      id: Date.now().toString(),
      author,
      content,
      timestamp: Date.now(),
      replies: []
    };
    const newThread = [...(thread || []), newPost];
    setThread(newThread);
    updateUrl(newThread, key);
  };

  const addReply = (parentId, content, author) => {
    const addReplyRecursive = (nodes) => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return {
            ...node,
            replies: [...node.replies, {
              id: Date.now().toString(),
              author,
              content,
              timestamp: Date.now(),
              replies: []
            }]
          };
        }
        if (node.replies) {
          return {
            ...node,
            replies: addReplyRecursive(node.replies)
          };
        }
        return node;
      });
    };

    const newThread = addReplyRecursive(thread);
    setThread(newThread);
    updateUrl(newThread, key);
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    addPost(newThreadContent, newThreadAuthor);
    setNewThreadContent('');
    setNewThreadAuthor('');
  };

  if (loading) return <div>Loading encrypted thread...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Encrypted Thread</h1>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        This thread is stored entirely in the URL, compressed and encrypted. 
        Share the URL to share the thread.
      </p>

      {(!thread || thread.length === 0) ? (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3>Start a new thread</h3>
          <form onSubmit={handleCreateThread}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                value={newThreadAuthor}
                onChange={(e) => setNewThreadAuthor(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Message:</label>
              <textarea
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                required
                rows={4}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <button 
              type="submit"
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Post Thread
            </button>
          </form>
        </div>
      ) : (
        <div>
          {thread.map(node => (
            <ThreadNode key={node.id} node={node} onReply={addReply} />
          ))}
          
          <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3>Start a new conversation</h3>
            <form onSubmit={handleCreateThread}>
              <input
                type="text"
                placeholder="Name"
                value={newThreadAuthor}
                onChange={(e) => setNewThreadAuthor(e.target.value)}
                required
                style={{ marginRight: '10px', padding: '5px' }}
              />
              <input
                type="text"
                placeholder="Message"
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                required
                style={{ marginRight: '10px', padding: '5px', width: '300px' }}
              />
              <button type="submit">Post</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Completion4;
