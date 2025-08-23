import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// User registration route
app.post('/make-server-3b039bbc/auth/register', async (c) => {
  try {
    const { email, password, name, role = 'student' } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Registration error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      role,
      created_at: new Date().toISOString()
    })

    return c.json({ user: data.user, message: 'User registered successfully' })
  } catch (error) {
    console.log('Registration error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Save student progress
app.post('/make-server-3b039bbc/progress/save', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { moduleId, progress, score, timeSpent, completed } = await c.req.json()

    const progressData = {
      userId: user.id,
      moduleId,
      progress,
      score,
      timeSpent,
      completed,
      lastUpdated: new Date().toISOString()
    }

    await kv.set(`progress:${user.id}:${moduleId}`, progressData)

    // Update user's overall stats
    const userStats = await kv.get(`stats:${user.id}`) || {
      totalModules: 0,
      completedModules: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      lastActivity: new Date().toISOString()
    }

    if (completed && !userStats.completedModules) {
      userStats.completedModules += 1
    }
    userStats.totalTimeSpent += timeSpent
    userStats.lastActivity = new Date().toISOString()

    await kv.set(`stats:${user.id}`, userStats)

    return c.json({ message: 'Progress saved successfully', progress: progressData })
  } catch (error) {
    console.log('Progress save error:', error)
    return c.json({ error: 'Failed to save progress' }, 500)
  }
})

// Get student progress
app.get('/make-server-3b039bbc/progress/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = c.req.param('userId')
    const progressData = await kv.getByPrefix(`progress:${userId}:`)
    const userStats = await kv.get(`stats:${userId}`)

    return c.json({ 
      progress: progressData,
      stats: userStats
    })
  } catch (error) {
    console.log('Get progress error:', error)
    return c.json({ error: 'Failed to get progress' }, 500)
  }
})

// Teacher dashboard analytics
app.get('/make-server-3b039bbc/analytics/dashboard', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get teacher's user data to verify role
    const teacherData = await kv.get(`user:${user.id}`)
    if (!teacherData || teacherData.role !== 'teacher') {
      return c.json({ error: 'Teacher access required' }, 403)
    }

    // Get all student progress data
    const allProgress = await kv.getByPrefix('progress:')
    const allStats = await kv.getByPrefix('stats:')
    const allUsers = await kv.getByPrefix('user:')

    // Calculate analytics
    const students = allUsers.filter(u => u.role === 'student')
    const totalStudents = students.length
    const activeStudents = allStats.filter(s => {
      const lastActivity = new Date(s.lastActivity)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return lastActivity > weekAgo
    }).length

    const moduleEngagement = {}
    let totalCompletedModules = 0
    let totalTimeSpent = 0
    let totalScores = 0
    let scoreCount = 0

    allProgress.forEach(progress => {
      const moduleId = progress.moduleId
      if (!moduleEngagement[moduleId]) {
        moduleEngagement[moduleId] = {
          name: moduleId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          students: 0,
          totalProgress: 0,
          completions: 0
        }
      }
      
      moduleEngagement[moduleId].students += 1
      moduleEngagement[moduleId].totalProgress += progress.progress
      
      if (progress.completed) {
        moduleEngagement[moduleId].completions += 1
        totalCompletedModules += 1
      }

      if (progress.score) {
        totalScores += progress.score
        scoreCount += 1
      }
    })

    allStats.forEach(stat => {
      totalTimeSpent += stat.totalTimeSpent || 0
    })

    const analytics = {
      totalStudents,
      activeStudents,
      completedModules: totalCompletedModules,
      averageProgress: scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0,
      averageTimePerSession: totalStudents > 0 ? Math.round(totalTimeSpent / totalStudents / 60) : 0,
      moduleEngagement: Object.entries(moduleEngagement).map(([key, data]) => ({
        ...data,
        progress: data.students > 0 ? Math.round(data.totalProgress / data.students) : 0
      }))
    }

    return c.json(analytics)
  } catch (error) {
    console.log('Analytics error:', error)
    return c.json({ error: 'Failed to get analytics' }, 500)
  }
})

// Get student list for teacher
app.get('/make-server-3b039bbc/students', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get teacher's user data to verify role
    const teacherData = await kv.get(`user:${user.id}`)
    if (!teacherData || teacherData.role !== 'teacher') {
      return c.json({ error: 'Teacher access required' }, 403)
    }

    const allUsers = await kv.getByPrefix('user:')
    const allStats = await kv.getByPrefix('stats:')
    const allProgress = await kv.getByPrefix('progress:')

    const students = allUsers
      .filter(u => u.role === 'student')
      .map(student => {
        const stats = allStats.find(s => s.userId === student.id) || {}
        const recentProgress = allProgress
          .filter(p => p.userId === student.id)
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0]

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          stats: {
            completedModules: stats.completedModules || 0,
            totalTimeSpent: stats.totalTimeSpent || 0,
            lastActivity: stats.lastActivity || student.created_at
          },
          currentModule: recentProgress ? {
            name: recentProgress.moduleId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            progress: recentProgress.progress,
            score: recentProgress.score,
            status: recentProgress.completed ? 'completed' : 'in-progress'
          } : null
        }
      })

    return c.json({ students })
  } catch (error) {
    console.log('Students list error:', error)
    return c.json({ error: 'Failed to get students' }, 500)
  }
})

// Invite student (add new student)
app.post('/make-server-3b039bbc/students/invite', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Verify teacher role
    const teacherData = await kv.get(`user:${user.id}`)
    if (!teacherData || teacherData.role !== 'teacher') {
      return c.json({ error: 'Teacher access required' }, 403)
    }

    const { email, name } = await c.req.json()

    if (!email || !name) {
      return c.json({ error: 'Email and name are required' }, 400)
    }

    // Check if student already exists
    const existingUsers = await kv.getByPrefix('user:')
    const existingStudent = existingUsers.find(u => u.email === email)
    
    if (existingStudent) {
      return c.json({ error: 'Student with this email already exists' }, 409)
    }

    // Generate a temporary password for the student
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    // Create the student account
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      user_metadata: { name, role: 'student', teacherId: user.id },
      email_confirm: true
    })

    if (error) {
      console.log('Student creation error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store student profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      role: 'student',
      teacherId: user.id,
      created_at: new Date().toISOString(),
      invited: true,
      tempPassword // Store temporarily for invitation email
    })

    // Initialize student stats
    await kv.set(`stats:${data.user.id}`, {
      userId: data.user.id,
      totalModules: 0,
      completedModules: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      lastActivity: new Date().toISOString()
    })

    return c.json({ 
      message: 'Student invited successfully',
      student: {
        id: data.user.id,
        name,
        email,
        tempPassword // Include for demo purposes
      }
    })
  } catch (error) {
    console.log('Invite student error:', error)
    return c.json({ error: 'Failed to invite student' }, 500)
  }
})

// Remove student
app.delete('/make-server-3b039bbc/students/:studentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Verify teacher role
    const teacherData = await kv.get(`user:${user.id}`)
    if (!teacherData || teacherData.role !== 'teacher') {
      return c.json({ error: 'Teacher access required' }, 403)
    }

    const studentId = c.req.param('studentId')

    // Verify student exists and belongs to this teacher
    const studentData = await kv.get(`user:${studentId}`)
    if (!studentData || studentData.role !== 'student') {
      return c.json({ error: 'Student not found' }, 404)
    }

    // Note: In a production app, you'd want to check if the student belongs to this teacher
    // For demo purposes, we'll allow any teacher to remove any student

    // Delete student from Supabase auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(studentId)
    if (deleteError) {
      console.log('Delete user error:', deleteError)
      // Continue with cleanup even if user deletion fails
    }

    // Clean up student data from KV store
    await kv.delete(`user:${studentId}`)
    await kv.delete(`stats:${studentId}`)
    
    // Delete all progress records for this student
    const studentProgress = await kv.getByPrefix(`progress:${studentId}:`)
    for (const progress of studentProgress) {
      await kv.delete(`progress:${studentId}:${progress.moduleId}`)
    }

    return c.json({ message: 'Student removed successfully' })
  } catch (error) {
    console.log('Remove student error:', error)
    return c.json({ error: 'Failed to remove student' }, 500)
  }
})

serve(app.fetch)