import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

// 🔧 UPDATE WITH YOUR IP
const API_URL = 'http://192.168.1.5:3001/entries';

interface Entry {
  _id: string;
  content: string;
  mood: string;
  createdAt: string;
}

export default function HomeScreen({ onLogout }: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch Entries (With Token)
  const fetchEntries = async () => {
    const token = await SecureStore.getItemAsync('token');
    try {
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` } // 🔑 Key Change
      });
      const data = await res.json();
      if(Array.isArray(data)) setEntries(data);
    } catch (error) {
      console.log('Error fetching:', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // 2. Submit Entry (With Token)
  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const token = await SecureStore.getItemAsync('token');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🔑 Key Change
        },
        body: JSON.stringify({ content: text }),
      });
      const newEntry = await res.json();

      setEntries([newEntry, ...entries]);
      setText('');
    } catch (error) {
      Alert.alert("Error", "Could not save entry.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for Mood Colors
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Happy': return '#dcfce7';
      case 'Good': return '#dbeafe';
      case 'Sad': return '#fce7f3';
      case 'Bad': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const renderItem = ({ item }: { item: Entry }) => (
    <View style={[styles.card, { backgroundColor: getMoodColor(item.mood) }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.moodText}>{item.mood}</Text>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.contentText}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📘 My Diary</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={{color: 'red'}}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="How are you feeling?"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 30 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  listContent: { padding: 15 },
  card: { padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  moodText: { fontWeight: 'bold', fontSize: 16 },
  dateText: { color: '#666', fontSize: 12 },
  contentText: { fontSize: 14, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fafafa' },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, maxHeight: 100 },
  button: { backgroundColor: '#000', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', marginLeft: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
