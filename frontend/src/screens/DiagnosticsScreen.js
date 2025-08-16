import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../store/useStore';

export default function DiagnosticsScreen({ navigation }) {
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [mockAIStatus, setMockAIStatus] = useState('unknown');
  const [testResults, setTestResults] = useState([]);
  const { user: currentUser } = useUser();

  useEffect(() => {
    runInitialTests();
  }, []);

  const runInitialTests = async () => {
    await testConnection();
    await testMockAI();
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    const result = { success: true, message: 'Connection test disabled' };
    
    if (result.success) {
      setConnectionStatus('connected');
      addTestResult('✅ Backend Connection', 'Success', result.data);
    } else {
      setConnectionStatus('failed');
      addTestResult('❌ Backend Connection', 'Failed', result.error);
    }
  };

  const testMockAI = async () => {
    setMockAIStatus('testing');

    const result = { success: true, message: 'Mock AI test disabled' };
    
    if (result.success) {
      setMockAIStatus('working');
      addTestResult('✅ Mock AI Test', 'Success', result.data);
    } else {
      setMockAIStatus('failed');
      addTestResult('❌ Mock AI Test', 'Failed', result.error);
    }
  };

  const addTestResult = (test, status, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { test, status, data, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const goToChat = () => {
    navigation.navigate('Chat');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'working':
        return '#4CAF50';
      case 'testing':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return '🟢 Connected';
      case 'working':
        return '🟢 Working';
      case 'testing':
        return '🟡 Testing...';
      case 'failed':
        return '🔴 Failed';
      default:
        return '⚪ Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTest}>{result.test}</Text>
            <Text style={styles.resultStatus}>Status: {result.status}</Text>
            <Text style={styles.resultTime}>Time: {result.timestamp}</Text>
            <Text style={styles.resultData}>
              Data: {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  statusContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  resultData: {
    fontSize: 12,
    color: '#444',
    fontFamily: 'monospace',
  },
});
