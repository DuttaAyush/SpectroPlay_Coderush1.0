import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Chrome as Home, FlaskConical, ChartBar, User, Settings, BookOpen, Award, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const MenuItem = ({ icon, title, onPress, isActive }) => (
  <TouchableOpacity
    style={[styles.menuItem, isActive && styles.activeMenuItem]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, isActive && styles.activeMenuIcon]}>
      {icon}
    </View>
    <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const HamburgerMenu = ({
  visible,
  onClose,
  activeRoute = 'Home',
}) => {
  const slideAnimation = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: visible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleMenuItemPress = (route) => {
    console.log(`Navigate to ${route}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnimation }],
            },
          ]}
        >
          <LinearGradient
            colors={['#0A0B1A', '#1F2937']}
            style={styles.menuGradient}
          >
            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>SJ</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>Sarah Johnson</Text>
                  <Text style={styles.userRole}>Teacher</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Navigation Items */}
            <View style={styles.menuContent}>
              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Navigation</Text>
                <MenuItem
                  icon={<Home size={22} color={activeRoute === 'Home' ? '#3B82F6' : '#9CA3AF'} />}
                  title="Home"
                  onPress={() => handleMenuItemPress('Home')}
                  isActive={activeRoute === 'Home'}
                />
                <MenuItem
                  icon={<FlaskConical size={22} color={activeRoute === 'Simulations' ? '#3B82F6' : '#9CA3AF'} />}
                  title="Simulations"
                  onPress={() => handleMenuItemPress('Simulations')}
                  isActive={activeRoute === 'Simulations'}
                />
                <MenuItem
                  icon={<ChartBar size={22} color={activeRoute === 'Dashboard' ? '#3B82F6' : '#9CA3AF'} />}
                  title="Dashboard"
                  onPress={() => handleMenuItemPress('Dashboard')}
                  isActive={activeRoute === 'Dashboard'}
                />
                <MenuItem
                  icon={<User size={22} color={activeRoute === 'Profile' ? '#3B82F6' : '#9CA3AF'} />}
                  title="Profile"
                  onPress={() => handleMenuItemPress('Profile')}
                  isActive={activeRoute === 'Profile'}
                />
              </View>

              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Learning</Text>
                <MenuItem
                  icon={<BookOpen size={22} color="#9CA3AF" />}
                  title="My Modules"
                  onPress={() => handleMenuItemPress('Modules')}
                />
                <MenuItem
                  icon={<Award size={22} color="#9CA3AF" />}
                  title="Achievements"
                  onPress={() => handleMenuItemPress('Achievements')}
                />
              </View>

              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Support</Text>
                <MenuItem
                  icon={<HelpCircle size={22} color="#9CA3AF" />}
                  title="Help & FAQ"
                  onPress={() => handleMenuItemPress('Help')}
                />
                <MenuItem
                  icon={<Settings size={22} color="#9CA3AF" />}
                  title="Settings"
                  onPress={() => handleMenuItemPress('Settings')}
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.menuFooter}>
              <MenuItem
                icon={<LogOut size={22} color="#EF4444" />}
                title="Sign Out"
                onPress={() => handleMenuItemPress('SignOut')}
              />
              <Text style={styles.versionText}>InsightXR v1.2.0</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    maxWidth: 320,
  },
  menuGradient: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    paddingTop: 20,
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRightWidth: 3,
    borderRightColor: '#3B82F6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activeMenuIcon: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D1D5DB',
  },
  activeMenuText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
});