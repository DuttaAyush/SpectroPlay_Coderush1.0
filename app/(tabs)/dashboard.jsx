import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Users, TrendingUp, Clock, Award, BookOpen, MoveHorizontal as MoreHorizontal, Filter, Download } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MetricCard = ({ title, value, change, icon, color }) => (
  <View style={styles.metricCard}>
    <LinearGradient
      colors={[color + '20', color + '10']}
      style={styles.metricGradient}
    >
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '30' }]}>
          {icon}
        </View>
        <Text style={styles.metricChange}>{change}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

const StudentRow = ({ name, avatar, progress, lastActive, modules }) => (
  <TouchableOpacity style={styles.studentRow} activeOpacity={0.7}>
    <View style={styles.studentAvatar}>
      <Text style={styles.avatarText}>{avatar}</Text>
    </View>
    <View style={styles.studentInfo}>
      <Text style={styles.studentName}>{name}</Text>
      <Text style={styles.studentDetails}>
        {modules} modules • Last active {lastActive}
      </Text>
    </View>
    <View style={styles.studentProgress}>
      <Text style={styles.progressText}>{progress}%</Text>
      <View style={styles.progressBar}>
        <View 
          style={[styles.progressFill, { width: `${progress}%` }]} 
        />
      </View>
    </View>
    <TouchableOpacity style={styles.moreButton}>
      <MoreHorizontal size={20} color="#9CA3AF" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const ChartBar = ({ label, value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <View style={styles.chartBarContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.chartBarTrack}>
        <LinearGradient
          colors={[color, color + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.chartBarFill, { width: `${percentage}%` }]}
        />
      </View>
      <Text style={styles.chartValue}>{value}</Text>
    </View>
  );
};

export default function DashboardScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All Classes');

  const students = [
    { name: 'Alice Johnson', avatar: 'AJ', progress: 92, lastActive: '2h ago', modules: 8 },
    { name: 'Bob Smith', avatar: 'BS', progress: 75, lastActive: '1d ago', modules: 6 },
    { name: 'Emma Davis', avatar: 'ED', progress: 88, lastActive: '4h ago', modules: 7 },
    { name: 'John Wilson', avatar: 'JW', progress: 69, lastActive: '3d ago', modules: 5 },
    { name: 'Sarah Brown', avatar: 'SB', progress: 94, lastActive: '1h ago', modules: 9 },
    { name: 'Mike Johnson', avatar: 'MJ', progress: 82, lastActive: '6h ago', modules: 7 },
  ];

  const moduleStats = [
    { label: 'DNA Replication', value: 24, maxValue: 30, color: '#06B6D4' },
    { label: 'Cell Division', value: 18, maxValue: 30, color: '#8B5CF6' },
    { label: 'Electromagnetism', value: 15, maxValue: 30, color: '#F59E0B' },
    { label: 'Orbital Mechanics', value: 12, maxValue: 30, color: '#10B981' },
    { label: 'Atomic Structure', value: 8, maxValue: 30, color: '#EF4444' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0A0B1A', '#1F2937']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Teacher Dashboard</Text>
            <Text style={styles.headerSubtitle}>24 Students</Text>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Download size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Metrics Overview */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Average Progress"
              value="82%"
              change="+5.2%"
              icon={<TrendingUp size={24} color="#10B981" />}
              color="#10B981"
            />
            <MetricCard
              title="Completed Modules"
              value="156"
              change="+12"
              icon={<BookOpen size={24} color="#3B82F6" />}
              color="#3B82F6"
            />
          </View>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Active Students"
              value="18"
              change="+3"
              icon={<Users size={24} color="#8B5CF6" />}
              color="#8B5CF6"
            />
            <MetricCard
              title="Avg. Time/Session"
              value="24min"
              change="+2min"
              icon={<Clock size={24} color="#F59E0B" />}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Module Engagement Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Module Engagement</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#9CA3AF" />
              <Text style={styles.filterText}>This Week</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            {moduleStats.map((stat, index) => (
              <ChartBar
                key={index}
                label={stat.label}
                value={stat.value}
                maxValue={stat.maxValue}
                color={stat.color}
              />
            ))}
          </View>
        </View>

        {/* Student Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Student Performance</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Filter size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <View style={styles.studentsContainer}>
            {students.map((student, index) => (
              <StudentRow
                key={index}
                name={student.name}
                avatar={student.avatar}
                progress={student.progress}
                lastActive={student.lastActive}
                modules={student.modules}
              />
            ))}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chartBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    width: 120,
    fontWeight: '500',
  },
  chartBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 24,
    textAlign: 'right',
  },
  studentsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  studentDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  studentProgress: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});