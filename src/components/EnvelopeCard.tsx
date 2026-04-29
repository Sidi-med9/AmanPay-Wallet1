import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingCart, BookOpen, Car, AlertTriangle, Wallet } from 'lucide-react-native';

interface EnvelopeProps {
  name: string;
  amount: number;
  type: string;
  description: string;
}

export const EnvelopeCard: React.FC<{ envelope: EnvelopeProps }> = ({ envelope }) => {
  const getIcon = () => {
    switch (envelope.name) {
      case 'الطعام': return <ShoppingCart size={24} color="#0EA5E9" />;
      case 'التعليم': return <BookOpen size={24} color="#0EA5E9" />;
      case 'النقل': return <Car size={24} color="#0EA5E9" />;
      case 'الطوارئ': return <AlertTriangle size={24} color="#F59E0B" />;
      default: return <Wallet size={24} color="#10B981" />;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{envelope.name}</Text>
          <Text style={styles.type}>{envelope.type}</Text>
        </View>
        <Text style={styles.amount}>{envelope.amount.toLocaleString()} MRU</Text>
      </View>
      <Text style={styles.description}>{envelope.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  type: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2C59',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 52, // Match icon padding + width
  },
});
