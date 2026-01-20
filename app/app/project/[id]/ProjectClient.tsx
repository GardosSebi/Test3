'use client'

import KanbanBoard from '@/components/KanbanBoard'
import QuickAddTask from '@/components/QuickAddTask'
import TaskDetailsModal from '@/components/TaskDetailsModal'
import { Task } from '@/types'
import { useState } from 'react'

interface ProjectClientProps {
  initialTasks: Task[]
  projectId: string
  projectName: string
}

export default function ProjectClient({ initialTasks, projectId, projectName }: ProjectClientProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handleAddTask = async (title: string, description?: string, deadline?: string, priority?: number) => {
    try {
      let dueAt: string | null = null
      if (deadline) {
        const date = new Date(deadline)
        date.setHours(23, 59, 59, 999)
        dueAt = date.toISOString()
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          projectId,
          notes: description || null,
          due_at: dueAt,
          priority: priority !== undefined ? priority : 0
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Set new tasks to NOT_STARTED by default
        const newTask = { ...data.task, status: 'NOT_STARTED' as const }
        setTasks((prev) => [newTask, ...prev])
      }
    } catch (error) {
      // Error('Error creating task:', error)
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    )

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        // Revert on error
        setTasks(initialTasks)
        throw new Error('Failed to update task')
      }

      const data = await res.json()
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? data.task : task))
      )
    } catch (error) {
      // Error('Error updating task:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        // Revert on error
        setTasks(initialTasks)
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      // Error('Error deleting task:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{projectName}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {tasks.length} {tasks.length === 1 ? 'sarcină' : 'sarcini'}
        </p>
      </div>

      <div className="mb-4">
        <QuickAddTask onAdd={handleAddTask} projectId={projectId} placeholder="Adaugă o sarcină la acest proiect..." />
      </div>

      <div className="mb-6">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskClick={setSelectedTask}
        />
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  )
}

