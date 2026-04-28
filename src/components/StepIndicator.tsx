import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentStep === index + 1 && styles.activeDot,
              currentStep > index + 1 && styles.completedDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#0EA5E9', // Light blue
    width: 32,
  },
  completedDot: {
    backgroundColor: '#10B981', // Green
  },
});
