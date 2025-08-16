const admin = require('firebase-admin');
const { getFirestore, getRealtimeDatabase } = require('../config/firebase');

const getStorageType = () => {
  return process.env.FIREBASE_STORAGE_TYPE || 'both';
};

const saveToFirestore = async (userId, text, role, metadata = {}) => {
  try {
    const db = getFirestore();
    
    const messageData = {
      text: text.trim(),
      role: role,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ...metadata
    };

    const messageRef = await db
      .collection('chats')
      .doc(userId)
      .collection('messages')
      .add(messageData);

    
    return {
      id: messageRef.id,
      ...messageData,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('❌ Firestore save error:', error);
    throw error;
  }
};

const saveToRealtimeDB = async (userId, text, role, metadata = {}) => {
  try {
    const rtdb = getRealtimeDatabase();
    
    const messageData = {
      text: text.trim(),
      role: role,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      createdAt: new Date().toISOString(),
      status: role === 'user' ? 'sent' : 'delivered',
      readAt: null,
      ...metadata
    };

    const messageRef = await rtdb
      .ref(`chats/${userId}/messages`)
      .push(messageData);

    await rtdb
      .ref(`users/${userId}/lastMessage`)
      .set({
        text: text.substring(0, 100),
        role: role,
        timestamp: admin.database.ServerValue.TIMESTAMP
      });

    
    return {
      id: messageRef.key,
      ...messageData,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('❌ Realtime DB save error:', error);
    throw error;
  }
};

const saveMessage = async (userId, text, role, metadata = {}) => {
  if (!userId || !text || !role) {
    throw new Error('userId, text, and role are required');
  }

  if (!['user', 'assistant'].includes(role)) {
    throw new Error('role must be either "user" or "assistant"');
  }

  const storageType = getStorageType();
  const results = {};

  try {

    if (storageType === 'firestore' || storageType === 'both') {
      try {
        results.firestore = await saveToFirestore(userId, text, role, metadata);
      } catch (error) {
        console.error('Firestore save failed:', error);
        if (storageType === 'firestore') throw error;
      }
    }

    if (storageType === 'realtime' || storageType === 'both') {
      try {
        results.realtimeDB = await saveToRealtimeDB(userId, text, role, metadata);
      } catch (error) {
        console.error('Realtime DB save failed:', error);
        if (storageType === 'realtime') throw error;
      }
    }

    const primaryResult = results.firestore || results.realtimeDB;
    
    if (!primaryResult) {
      throw new Error('Failed to save to any storage system');
    }

    primaryResult.savedTo = Object.keys(results);
    
    return primaryResult;

  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

const getMessagesFromFirestore = async (userId, limit = 50, since = null) => {
  try {
    const db = getFirestore();
    
    let query = db
      .collection('chats')
      .doc(userId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (since) {
      query = query.where('timestamp', '>', admin.firestore.Timestamp.fromDate(since));
    }

    const snapshot = await query.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        role: data.role,
        timestamp: data.timestamp?.toDate?.()?.getTime() || Date.now(),
        createdAt: data.createdAt,
        status: data.status,
        readAt: data.readAt,
        source: 'firestore'
      });
    });

    return messages.reverse();

  } catch (error) {
    console.error('Error getting messages from Firestore:', error);
    throw error;
  }
};

const getMessagesFromRealtimeDB = async (userId, limit = 50) => {
  try {
    const rtdb = getRealtimeDatabase();
    
    const snapshot = await rtdb
      .ref(`chats/${userId}/messages`)
      .orderByChild('timestamp')
      .limitToLast(limit)
      .once('value');

    const messages = [];
    const data = snapshot.val();
    
    if (data) {
      Object.keys(data).forEach(key => {
        const message = data[key];
        messages.push({
          id: key,
          text: message.text,
          role: message.role,
          timestamp: message.timestamp || Date.now(),
          createdAt: message.createdAt,
          status: message.status,
          readAt: message.readAt,
          source: 'realtimeDB'
        });
      });
    }

    return messages.sort((a, b) => a.timestamp - b.timestamp);

  } catch (error) {
    console.error('Error getting messages from Realtime DB:', error);
    throw error;
  }
};

const getMessages = async (userId, limit = 50, since = null) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  const storageType = getStorageType();

  try {

    if (storageType === 'firestore' || storageType === 'both') {
      try {
        return await getMessagesFromFirestore(userId, limit, since);
      } catch (error) {
        console.error('Firestore fetch failed:', error);
        if (storageType === 'firestore') throw error;
      }
    }

    if (storageType === 'realtime' || storageType === 'both') {
      return await getMessagesFromRealtimeDB(userId, limit);
    }

    throw new Error('No storage system available');

  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

const getRecentHistory = async (userId, limit = 10) => {
  try {
    return await getMessages(userId, limit);
  } catch (error) {
    console.error('Error getting recent history:', error);
    return [];
  }
};

const clearChatHistory = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  const storageType = getStorageType();
  let deletedCount = 0;

  try {

    if (storageType === 'firestore' || storageType === 'both') {
      try {
        const db = getFirestore();
        const messagesRef = db
          .collection('chats')
          .doc(userId)
          .collection('messages');

        const snapshot = await messagesRef.get();
        
        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          deletedCount += snapshot.size;
        }
      } catch (error) {
        console.error('Error clearing Firestore:', error);
      }
    }

    if (storageType === 'realtime' || storageType === 'both') {
      try {
        const rtdb = getRealtimeDatabase();
        await rtdb.ref(`chats/${userId}/messages`).remove();
        await rtdb.ref(`users/${userId}/lastMessage`).remove();
      } catch (error) {
        console.error('Error clearing Realtime DB:', error);
      }
    }

    return deletedCount;

  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

const getChatStats = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  const storageType = getStorageType();

  try {

    if (storageType === 'firestore' || storageType === 'both') {
      try {
        const db = getFirestore();
        const messagesRef = db
          .collection('chats')
          .doc(userId)
          .collection('messages');

        const [totalSnapshot, userSnapshot, assistantSnapshot] = await Promise.all([
          messagesRef.get(),
          messagesRef.where('role', '==', 'user').get(),
          messagesRef.where('role', '==', 'assistant').get()
        ]);

        return {
          totalMessages: totalSnapshot.size,
          userMessages: userSnapshot.size,
          assistantMessages: assistantSnapshot.size,
          lastActivity: totalSnapshot.empty ? null : 
            Math.max(...totalSnapshot.docs.map(doc => 
              doc.data().timestamp?.toDate?.()?.getTime() || 0
            )),
          source: 'firestore'
        };
      } catch (error) {
        console.error('Error getting Firestore stats:', error);
      }
    }

    if (storageType === 'realtime' || storageType === 'both') {
      const rtdb = getRealtimeDatabase();
      const snapshot = await rtdb.ref(`chats/${userId}/messages`).once('value');
      const data = snapshot.val();
      
      if (!data) {
        return {
          totalMessages: 0,
          userMessages: 0,
          assistantMessages: 0,
          lastActivity: null,
          source: 'realtimeDB'
        };
      }

      const messages = Object.values(data);
      const userMessages = messages.filter(msg => msg.role === 'user').length;
      const assistantMessages = messages.filter(msg => msg.role === 'assistant').length;
      const lastActivity = Math.max(...messages.map(msg => msg.timestamp || 0));

      return {
        totalMessages: messages.length,
        userMessages,
        assistantMessages,
        lastActivity,
        source: 'realtimeDB'
      };
    }

    throw new Error('No storage system available for stats');

  } catch (error) {
    console.error('Error getting chat stats:', error);
    throw error;
  }
};

const getStorageStatus = () => {
  const storageType = getStorageType();
  
  return {
    storageType,
    firestoreEnabled: ['firestore', 'both'].includes(storageType),
    realtimeDBEnabled: ['realtime', 'both'].includes(storageType),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID
  };
};

module.exports = {
  saveMessage,
  getMessages,
  getRecentHistory,
  clearChatHistory,
  getChatStats,
  getStorageStatus,

  saveToFirestore,
  saveToRealtimeDB,
  getMessagesFromFirestore,
  getMessagesFromRealtimeDB
};
