import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Globe, MapPin } from 'lucide-react-native';

interface RouteProps {
  type: string;
  from: string;
  to: string;
  fxRate?: string;
  settlement: string;
}

interface RouteCardProps {
  route: RouteProps;
  selected: boolean;
  onSelect: () => void;
  isInternational?: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, selected, onSelect, isInternational }) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {isInternational ? (
            <Globe size={24} color={selected ? "#0EA5E9" : "#9CA3AF"} />
          ) : (
            <MapPin size={24} color={selected ? "#0EA5E9" : "#9CA3AF"} />
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.type, selected && styles.selectedText]}>{route.type}</Text>
          <Text style={styles.routeText}>{route.from} ← {route.to}</Text>
        </View>
        {selected && <CheckCircle2 size={24} color="#10B981" />}
      </View>
      <View style={styles.details}>
        {route.fxRate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>سعر الصرف:</Text>
            <Text style={styles.detailValue}>{route.fxRate}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>التسوية:</Text>
          <Text style={styles.detailValue}>{route.settlement}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedCard: {
    borderColor: '#0EA5E9', // Light blue
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  type: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  selectedText: {
    color: '#0F2C59',
  },
  routeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
});
