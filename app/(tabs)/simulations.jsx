import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Play, RotateCcw, Settings, Mic, Hand, Volume2, ArrowLeft, Maximize, MoveVertical as MoreVertical } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ControlButton = ({
  icon,
  label,
  onPress,
  variant = 'secondary',
  disabled = false,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.controlButton, styles.primaryButton];
      case 'danger':
        return [styles.controlButton, styles.dangerButton];
      default:
        return [styles.controlButton, styles.secondaryButton];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
      <Text style={[
        styles.controlButtonText,
        variant === 'primary' && styles.primaryButtonText,
        disabled && styles.disabledText,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const GestureIndicator = ({ gesture, description, icon }) => (
  <View style={styles.gestureIndicator}>
    <View style={styles.gestureIcon}>
      {icon}
    </View>
    <View style={styles.gestureContent}>
      <Text style={styles.gestureLabel}>{gesture}</Text>
      <Text style={styles.gestureDescription}>{description}</Text>
    </View>
  </View>
);

export default function SimulationsScreen() {
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  const handleStartExperiment = () => {
    setIsSimulationActive(true);
  };

  const handleResetSimulation = () => {
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isSimulationActive) {
    return (
      <View style={styles.simulationContainer}>
        <StatusBar style="light" backgroundColor="#0A0B1A" />
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.1)', 'rgba(59, 130, 246, 0.1)']}
          style={styles.arOverlay}
        >
          {/* Simulation Content Placeholder */}
          <View style={styles.simulationContent}>
            <View style={styles.dnaVisualization}>
              <Text style={styles.simulationTitle}>Cell Division</Text>
              <Text style={styles.simulationSubtitle}>Step {currentStep} of {totalSteps}</Text>
              
              {/* 3D Model Placeholder */}
              <View style={styles.modelContainer}>
                <LinearGradient
                  colors={['#3B82F6', '#8B5CF6']}
                  style={styles.modelPlaceholder}
                >
                  <Text style={styles.modelText}>3D Cell Model</Text>
                  <Text style={styles.modelSubtext}>Mitosis in Progress</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Gesture and Voice Controls */}
          <View style={styles.controlsOverlay}>
            <View style={styles.gestureControls}>
              <TouchableOpacity style={styles.iconButton}>
                <Hand size={24} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Volume2 size={24} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.simulationControls}>
              <TouchableOpacity 
                style={[styles.iconButton, currentStep <= 1 && styles.disabledButton]}
                onPress={handlePreviousStep}
                disabled={currentStep <= 1}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.stepControls}>
                <TouchableOpacity style={styles.stepButton} onPress={handleResetSimulation}>
                  <RotateCcw size={20} color="#FFFFFF" />
                  <Text style={styles.stepButtonText}>Reset</Text>
                </TouchableOpacity>
                
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepText}>{currentStep}/{totalSteps}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.iconButton, currentStep >= totalSteps && styles.disabledButton]}
                onPress={handleNextStep}
                disabled={currentStep >= totalSteps}
              >
                <ArrowLeft size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Exit Button */}
          <TouchableOpacity 
            style={styles.exitButton}
            onPress={() => setIsSimulationActive(false)}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0A0B1A" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0A0B1A', '#1F2937']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Cell Division</Text>
        <Text style={styles.headerSubtitle}>Interactive 3D Simulation</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Learning Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Objectives</Text>
          <Text style={styles.description}>
            Explore the intricate process of cell division through immersive AR visualization.
          </Text>
          <View style={styles.objectivesList}>
            <Text style={styles.objective}>• Understand chromosome behavior during division</Text>
            <Text style={styles.objective}>• Observe spindle fiber formation and function</Text>
            <Text style={styles.objective}>• Recognize cellular changes throughout the process</Text>
          </View>
        </View>

        {/* Control Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Interact</Text>
          <View style={styles.instructionsGrid}>
            <GestureIndicator
              gesture="Pinch to Zoom"
              description="Examine cellular details closely"
              icon={<Hand size={24} color="#3B82F6" />}
            />
            <GestureIndicator
              gesture="Voice Commands"
              description="Say 'rotate', 'zoom in', 'next phase'"
              icon={<Volume2 size={24} color="#8B5CF6" />}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <ControlButton
            icon={<Play size={24} color="#FFFFFF" />}
            label="START EXPERIMENT"
            onPress={handleStartExperiment}
            variant="primary"
          />
          
          <View style={styles.secondaryActions}>
            <ControlButton
              icon={<Settings size={20} color="#9CA3AF" />}
              label="Settings"
              onPress={() => console.log('Settings')}
            />
            <ControlButton
              icon={<MoreVertical size={20} color="#9CA3AF" />}
              label="More"
              onPress={() => console.log('More')}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  objectivesList: {
    gap: 8,
  },
  objective: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  instructionsGrid: {
    gap: 16,
  },
  gestureIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  gestureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gestureContent: {
    flex: 1,
  },
  gestureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gestureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#4B5563',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomSpacing: {
    height: 100,
  },
  
  // Simulation Screen Styles
  simulationContainer: {
    flex: 1,
    backgroundColor: '#0A0B1A',
  },
  arOverlay: {
    flex: 1,
  },
  simulationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dnaVisualization: {
    alignItems: 'center',
    marginBottom: 40,
  },
  simulationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  simulationSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
  },
  modelContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modelPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modelSubtext: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gestureControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  simulationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderRadius: 20,
    padding: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  stepButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#4B5563',
    opacity: 0.5,
  },
  exitButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});