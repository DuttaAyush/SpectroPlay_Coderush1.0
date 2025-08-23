import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Login error:', error.message);
          setError('Login failed: ' + error.message);
          return;
        }

        if (data.session) {
          onAuthSuccess();
        }
      } else {
        // Register
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b039bbc/auth/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: formData.role
          })
        });

        if (response.ok) {
          // Auto-login after registration
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) {
            setError('Registration succeeded but login failed: ' + error.message);
            return;
          }

          if (data.session) {
            onAuthSuccess();
          }
        } else {
          const errorData = await response.json();
          setError('Registration failed: ' + errorData.error);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to sign in with demo student first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: 'student@demo.com',
        password: 'demo123456',
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // Create demo student if doesn't exist
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b039bbc/auth/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'student@demo.com',
            password: 'demo123456',
            name: 'Demo Student',
            role: 'student'
          })
        });

        if (response.ok) {
          // Now sign in with the created user
          const signInResult = await supabase.auth.signInWithPassword({
            email: 'student@demo.com',
            password: 'demo123456',
          });

          data = signInResult.data;
          error = signInResult.error;
        } else {
          const errorData = await response.json();
          setError('Failed to create demo user: ' + errorData.error);
          return;
        }
      }

      if (error) {
        setError('Demo login failed: ' + error.message);
        return;
      }

      if (data?.session) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoTeacherLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to sign in with demo teacher first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: 'teacher@demo.com',
        password: 'demo123456',
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // Create demo teacher if doesn't exist
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b039bbc/auth/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'teacher@demo.com',
            password: 'demo123456',
            name: 'Demo Teacher',
            role: 'teacher'
          })
        });

        if (response.ok) {
          // Now sign in with the created user
          const signInResult = await supabase.auth.signInWithPassword({
            email: 'teacher@demo.com',
            password: 'demo123456',
          });

          data = signInResult.data;
          error = signInResult.error;
        } else {
          const errorData = await response.json();
          setError('Failed to create demo teacher: ' + errorData.error);
          return;
        }
      }

      if (error) {
        setError('Demo teacher login failed: ' + error.message);
        return;
      }

      if (data?.session) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Demo teacher login error:', error);
      setError('Demo teacher login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-blue-400 mb-2">InsightXR</h1>
          <p className="text-gray-400">Immersive STEM Education Platform</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center rounded-lg ${
                isLogin ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center rounded-lg ${
                !isLogin ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
                
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </>
            )}
            
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              className="bg-gray-700 border-gray-600 text-white"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
            >
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-gray-500 text-sm">OR</div>
            
            <Button
              onClick={handleDemoLogin}
              disabled={loading}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Demo Student Login
            </Button>
            
            <Button
              onClick={handleDemoTeacherLogin}
              disabled={loading}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Demo Teacher Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}