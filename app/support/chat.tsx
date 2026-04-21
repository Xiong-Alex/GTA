import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getChatReply } from '../../lib/local-data';

const COLORS = {
  primary: '#0033A0',
  darkBlue: '#000063',
  mediumBlue: '#2D67FF',
  lightBlue: '#328DFF',
  black: '#000000',
  gray: '#666666',
  white: '#FFFFFF',
  background: '#F0F4F8',
  lightGray: '#E5E7EB',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  'How do I book a flight?',
  'What is the expense policy?',
  'How do I request a hotel change?',
  'What should I do during a travel emergency?',
];

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hello. I'm your local travel operations assistant for this prototype. I can help with booking questions, expense guidance, travel changes, and support routing while the live backend is still pending.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await getChatReply(text.trim());
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble loading the local assistant right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="sparkles" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Operations Assistant</Text>
                <Text style={styles.headerSubtitle}>Local prototype mode</Text>
              </View>
            </View>
            <View style={styles.placeholder} />
          </View>

          <TouchableOpacity style={styles.liveAgentStrip} onPress={() => sendMessage('I want to chat with a live agent.')}>
            <View style={styles.liveAgentIcon}>
              <Ionicons name="headset" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.liveAgentContent}>
              <Text style={styles.liveAgentTitle}>Chat with a live agent</Text>
              <Text style={styles.liveAgentSubtitle}>Escalate this request for human support and issue routing.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.role === 'user' && styles.messageRowUser]}>
              {message.role === 'assistant' && (
                <View style={styles.avatarAssistant}>
                  <Ionicons name="sparkles" size={16} color={COLORS.white} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant,
                ]}
              >
                <Text style={[styles.messageText, message.role === 'user' && styles.messageTextUser]}>{message.content}</Text>
                <Text style={[styles.messageTime, message.role === 'user' && styles.messageTimeUser]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.messageRow}>
              <View style={styles.avatarAssistant}>
                <Ionicons name="sparkles" size={16} color={COLORS.white} />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAssistant]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}

          {messages.length <= 1 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Suggested prompts</Text>
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <TouchableOpacity key={suggestion} style={styles.suggestionChip} onPress={() => sendMessage(suggestion)}>
                  <View style={styles.suggestionIcon}>
                    <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask a travel operations question..."
              placeholderTextColor={COLORS.gray}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : <Ionicons name="send" size={20} color={COLORS.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 16,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: COLORS.lightBlue, marginTop: 2 },
  placeholder: { width: 44 },
  liveAgentStrip: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveAgentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveAgentContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  liveAgentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  liveAgentSubtitle: {
    fontSize: 12,
    color: COLORS.lightBlue,
    marginTop: 3,
    lineHeight: 17,
  },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 22 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  avatarAssistant: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: { maxWidth: '78%', padding: 14, borderRadius: 18 },
  messageBubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  messageBubbleAssistant: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.05)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: { fontSize: 15, color: COLORS.black, lineHeight: 22 },
  messageTextUser: { color: COLORS.white },
  messageTime: { fontSize: 11, color: COLORS.gray, marginTop: 6 },
  messageTimeUser: { color: 'rgba(255,255,255,0.7)' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', height: 24, paddingHorizontal: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginHorizontal: 3 },
  typingDot1: { opacity: 0.4 },
  typingDot2: { opacity: 0.6 },
  typingDot3: { opacity: 0.8 },
  suggestions: { marginTop: 10 },
  suggestionsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray, marginBottom: 12 },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionText: { fontSize: 14, color: COLORS.black, flex: 1 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  inputWrapper: { flex: 1, backgroundColor: COLORS.background, borderRadius: 24, marginRight: 10 },
  input: { paddingHorizontal: 18, paddingVertical: 12, fontSize: 16, color: COLORS.black, maxHeight: 100 },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
