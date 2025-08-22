import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { User, Settings, Bell, Moon, Volume2, Download, CircleHelp as HelpCircle, Shield, ChevronRight, Award, BookOpen, Clock, CreditCard as Edit } from 'lucide-react-native';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchToggle?: (value: boolean) => void;
  showChevron?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  hasSwitch,
  switchValue,
  onSwitchToggle,
  showChevron = true,
}) => (
  <TouchableOpacity 
    style={styles.settingRow} 
    onPress={onPress}
    activeOpacity={hasSwitch ? 1 : 0.7}
  >
    <View style={styles.settingIcon}>
      {icon}
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {hasSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onSwitchToggle}
        trackColor={{ false: '#374151', true: '#3B82F6' }}
        thumbColor={switchValue ? '#FFFFFF' : '#9CA3AF'}
      />
    ) : (
      showChevron && <ChevronRight size={20} color="#9CA3AF" />
    )}
  </TouchableOpacity>
);

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderColor: color + '30' }]}>
    <LinearGradient
      colors={[color + '20', color + '10']}
      style={styles.statGradient}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '30' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  </View>
);

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [offlineDownload, setOfflineDownload] = useState(false);

  const handleEditProfile = () => {
    console.log('Edit profile');
  };

  const handleSettingPress = (setting: string) => {
    console.log(`Navigate to ${setting}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0A0B1A', '#1F2937']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>SJ</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Edit size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Sarah Johnson</Text>
          <Text style={styles.profileRole}>Teacher • Grade 9-12 Biology</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Award size={20} color="#F59E0B" />}
              value="24"
              label="Students"
              color="#F59E0B"
            />
            <StatCard
              icon={<BookOpen size={20} color="#10B981" />}
              value="8"
              label="Modules Created"
              color="#10B981"
            />
            <StatCard
              icon={<Clock size={20} color="#8B5CF6" />}
              value="142h"
              label="Teaching Time"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsContainer}>
            <SettingRow
              icon={<Bell size={20} color="#3B82F6" />}
              title="Notifications"
              subtitle="Get updates about student progress"
              hasSwitch
              switchValue={notificationsEnabled}
              onSwitchToggle={setNotificationsEnabled}
            />
            <SettingRow
              icon={<Moon size={20} color="#8B5CF6" />}
              title="Dark Mode"
              subtitle="Optimized for AR/VR experiences"
              hasSwitch
              switchValue={darkModeEnabled}
              onSwitchToggle={setDarkModeEnabled}
            />
            <SettingRow
              icon={<Volume2 size={20} color="#10B981" />}
              title="Sound Effects"
              subtitle="Audio feedback in simulations"
              hasSwitch
              switchValue={soundEnabled}
              onSwitchToggle={setSoundEnabled}
            />
            <SettingRow
              icon={<Download size={20} color="#F59E0B" />}
              title="Offline Downloads"
              subtitle="Download content for offline access"
              hasSwitch
              switchValue={offlineDownload}
              onSwitchToggle={setOfflineDownload}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsContainer}>
            <SettingRow
              icon={<User size={20} color="#3B82F6" />}
              title="Personal Information"
              subtitle="Update your profile details"
              onPress={() => handleSettingPress('personal-info')}
            />
            <SettingRow
              icon={<Shield size={20} color="#EF4444" />}
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => handleSettingPress('privacy')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsContainer}>
            <SettingRow
              icon={<HelpCircle size={20} color="#8B5CF6" />}
              title="Help & FAQ"
              subtitle="Get help with AR/VR features"
              onPress={() => handleSettingPress('help')}
            />
            <SettingRow
              icon={<Settings size={20} color="#9CA3AF" />}
              title="Advanced Settings"
              subtitle="AR/VR calibration and more"
              onPress={() => handleSettingPress('advanced')}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A0B1A',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
});