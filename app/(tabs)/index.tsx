import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { AArrowDown as DNA, Zap, Globe, Atom, ArrowRight, Play } from 'lucide-react-native';

interface ModuleTileProps {
  title: string;
  description: string;
  progress: number;
  icon: React.ReactNode;
  imageUrl: string;
  onPress: () => void;
  isNew?: boolean;
}

const ModuleTile: React.FC<ModuleTileProps> = ({
  title,
  description,
  progress,
  icon,
  imageUrl,
  onPress,
  isNew,
}) => (
  <TouchableOpacity style={styles.moduleTile} onPress={onPress} activeOpacity={0.8}>
    <ImageBackground
      source={{ uri: imageUrl }}
      style={styles.moduleBackground}
      imageStyle={styles.moduleImage}
    >
      <LinearGradient
        colors={['rgba(10, 11, 26, 0.3)', 'rgba(10, 11, 26, 0.9)']}
        style={styles.moduleOverlay}
      >
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <View style={styles.moduleIcon}>
          {icon}
        </View>
        <View style={styles.moduleContent}>
          <Text style={styles.moduleTitle}>{title}</Text>
          <Text style={styles.moduleDescription}>{description}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>
        <View style={styles.moduleAction}>
          <ArrowRight size={20} color="#3B82F6" />
        </View>
      </LinearGradient>
    </ImageBackground>
  </TouchableOpacity>
);

const QuickActionCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
}> = ({ title, subtitle, icon, onPress }) => (
  <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.quickActionIcon}>
      {icon}
    </View>
    <View style={styles.quickActionContent}>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const handleModulePress = (moduleName: string) => {
    console.log(`Opening ${moduleName} module`);
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0A0B1A', '#1F2937']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Good morning, Sarah!</Text>
          <Text style={styles.subtitle}>Continue your STEM journey</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Resume Learning"
              subtitle="Cell Division"
              icon={<Play size={24} color="#3B82F6" />}
              onPress={() => handleQuickAction('resume')}
            />
            <QuickActionCard
              title="Take Quiz"
              subtitle="DNA Replication"
              icon={<Atom size={24} color="#8B5CF6" />}
              onPress={() => handleQuickAction('quiz')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STEM Modules</Text>
          
          <ModuleTile
            title="DNA Replication"
            description="Explore molecular biology through immersive 3D visualization"
            progress={85}
            icon={<DNA size={32} color="#06B6D4" />}
            imageUrl="https://images.pexels.com/photos/3825539/pexels-photo-3825539.jpeg"
            onPress={() => handleModulePress('DNA Replication')}
            isNew
          />

          <ModuleTile
            title="Electromagnetism"
            description="Understand magnetic fields and electromagnetic forces"
            progress={60}
            icon={<Zap size={32} color="#F59E0B" />}
            imageUrl="https://images.pexels.com/photos/414860/pexels-photo-414860.jpeg"
            onPress={() => handleModulePress('Electromagnetism')}
          />

          <ModuleTile
            title="Orbital Mechanics"
            description="Discover planetary motion and gravitational forces"
            progress={40}
            icon={<Globe size={32} color="#10B981" />}
            imageUrl="https://images.pexels.com/photos/73871/rocket-launch-rocket-take-off-nasa-73871.jpeg"
            onPress={() => handleModulePress('Orbital Mechanics')}
          />

          <ModuleTile
            title="Atomic Structure"
            description="Journey into the world of atoms and subatomic particles"
            progress={25}
            icon={<Atom size={32} color="#8B5CF6" />}
            imageUrl="https://images.pexels.com/photos/7723506/pexels-photo-7723506.jpeg"
            onPress={() => handleModulePress('Atomic Structure')}
          />
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
  headerContent: {
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moduleTile: {
    height: 140,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  moduleBackground: {
    flex: 1,
  },
  moduleImage: {
    borderRadius: 20,
  },
  moduleOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  newBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  moduleIcon: {
    alignSelf: 'flex-start',
  },
  moduleContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    minWidth: 32,
  },
  moduleAction: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});