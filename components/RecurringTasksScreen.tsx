import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, RecurringTask } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { PlusCircleIcon, Check, GripVertical } from './icons';
import toast from 'react-hot-toast';
import { getCurrencySymbol } from '../utils/currency';

interface RecurringTaskFormProps {
  task?: RecurringTask;
  onSave: (taskData: Omit<RecurringTask, 'id' | 'recipient' | 'createdAt' | 'isCompleted'> & { id?: string, recipientPhone: string }) => Promise<void>;
  onCancel: () => void;
}

const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({ task, onSave, onCancel }) => {
  const [recipientPhone, setRecipientPhone] = useState(task?.recipient.phone || '');
  const [amount, setAmount] = useState(task?.amount.toString() || '');
  const [recurrence, setRecurrence] = useState<RecurringTask['recurrence']>(task?.recurrence || null);
  const [notes, setNotes] = useState(task?.notes || '');
  
  const formatDateForInput = (timestamp: number) => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTomorrowTimestamp = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.getTime();
  };
  const [dueDate, setDueDate] = useState(task ? formatDateForInput(task.nextDueDate) : formatDateForInput(getTomorrowTimestamp()));

  const [isValidRecipient, setIsValidRecipient] = useState<boolean | null>(task ? true : null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Basic format check
    if (!/^\+8801[3-9]\d{8}$/.test(recipientPhone)) {
      setIsValidRecipient(null);
      return;
    }

    setIsChecking(true);
    const handler = setTimeout(() => {
      api.findUserByPhone(recipientPhone).then(user => {
        setIsValidRecipient(!!user);
        setIsChecking(false);
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [recipientPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidRecipient || !amount || !dueDate) return;
    setIsSaving(true);
    await onSave({
      id: task?.id,
      recipientPhone,
      amount: parseFloat(amount),
      recurrence,
      notes,
      nextDueDate: new Date(dueDate + 'T00:00:00').getTime(), // Ensure it's parsed as local time
    });
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header title={task ? 'Edit Scheduled Payment' : 'New Scheduled Payment'} onBack={onCancel} />
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label htmlFor="recipientPhone" className="block text-sm font-medium text-muted-foreground">Recipient's Phone</label>
          <input
            id="recipientPhone" type="tel" value={recipientPhone}
            onChange={e => setRecipientPhone(e.target.value)}
            className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="+8801XXXXXXXXX" required
          />
          <div className="h-4 mt-1">
            {isChecking && <p className="text-xs text-yellow-600 dark:text-yellow-400">Checking...</p>}
            {isValidRecipient === false && <p className="text-xs text-destructive">User not found.</p>}
            {isValidRecipient === true && <p className="text-xs text-primary">Recipient found.</p>}
          </div>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground">Amount (BDT)</label>
          <input
            id="amount" type="number" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0.00" required
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-muted-foreground">Due Date</label>
          <input
            id="dueDate" type="date" value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
        <div>
          <label htmlFor="recurrence" className="block text-sm font-medium text-muted-foreground">Recurrence</label>
          <select
            id="recurrence" value={recurrence || 'null'}
            onChange={e => setRecurrence(e.target.value === 'null' ? null : e.target.value as RecurringTask['recurrence'])}
            className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="null">None (One-time)</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground">Notes (Optional)</label>
          <textarea
            id="notes" value={notes}
            onChange={e => setNotes(e.target.value)} rows={3}
            className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g., Monthly rent"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:bg-secondary/80">Cancel</button>
          <button type="submit" disabled={!isValidRecipient || isSaving || !amount} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
};


const RecurringTasksScreen: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<RecurringTask | {} | null>(null);

  // Refs for drag and drop
  const dragItem = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    api.getRecurringTasks().then(data => {
      const sortedData = data.sort((a, b) => (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0));
      setTasks(sortedData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSave = async (taskData: any) => {
    await api.saveRecurringTask(taskData);
    setEditingTask(null);
    fetchTasks();
  };

  const handleToggleCompletion = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // Prevent card's onClick from firing

    // Optimistic UI update
    setTasks(currentTasks => 
      currentTasks.map(t => 
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ).sort((a, b) => (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0))
    );

    const updatedTask = await api.toggleTaskCompletion(taskId);
    if (!updatedTask) {
      toast.error("Failed to update task.");
      // Revert on failure
      fetchTasks();
    }
  };

  // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        dragItem.current = taskId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
        setTimeout(() => {
            const el = document.getElementById(`task-${taskId}`);
            if(el) el.classList.add('opacity-50');
        }, 0);
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetTaskId: string) => {
        e.preventDefault();
        if (dragItem.current !== targetTaskId) {
            setDragOverId(targetTaskId);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItemId = dragItem.current;
        const targetItemId = dragOverId;
        
        if (draggedItemId && targetItemId && draggedItemId !== targetItemId) {
            setTasks(currentTasks => {
                const draggedItemIndex = currentTasks.findIndex(t => t.id === draggedItemId);
                const targetItemIndex = currentTasks.findIndex(t => t.id === targetItemId);
                
                if (draggedItemIndex === -1 || targetItemIndex === -1) return currentTasks;
                
                let newTasks = [...currentTasks];
                const [removed] = newTasks.splice(draggedItemIndex, 1);
                newTasks.splice(targetItemIndex, 0, removed);
                
                // Re-sort to push completed tasks to the bottom, preserving the new order of incomplete tasks
                newTasks.sort((a, b) => (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0));
                
                return newTasks;
            });
        }
        handleDragEnd(); // Call cleanup
    };

    const handleDragEnd = () => {
        if (dragItem.current) {
            const el = document.getElementById(`task-${dragItem.current}`);
            if(el) el.classList.remove('opacity-50');
        }
        dragItem.current = null;
        setDragOverId(null);
    };


  if (editingTask) {
    return (
      <RecurringTaskForm
        task={Object.keys(editingTask).length > 0 ? editingTask as RecurringTask : undefined}
        onSave={handleSave}
        onCancel={() => setEditingTask(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header title="Scheduled Payments" onBack={onBack} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4">
          <button
            onClick={() => setEditingTask({})}
            className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-3 bg-primary/10 text-primary font-semibold rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Schedule New Payment
          </button>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading scheduled tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No scheduled payments found.</p>
          ) : (
            <div className="space-y-3" onDragOver={(e) => e.preventDefault()}>
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  id={`task-${task.id}`}
                  draggable={!task.isCompleted}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnter={(e) => handleDragEnter(e, task.id)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  className={`bg-card/80 backdrop-blur-xl border rounded-2xl p-4 shadow-sm transition-all duration-300 relative ${
                    task.isCompleted ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'
                  } ${dragOverId === task.id ? 'drag-over-indicator' : 'border-border'}`}
                >
                  <div className="flex items-start gap-4">
                       <button
                          type="button"
                          role="checkbox"
                          aria-checked={task.isCompleted}
                          onClick={(e) => handleToggleCompletion(e, task.id)}
                          className={`mt-1 w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                            task.isCompleted ? 'bg-primary border-primary' : 'bg-transparent border-muted-foreground/50'
                          }`}
                        >
                          {task.isCompleted && <Check className="w-4 h-4 text-primary-foreground animate-check-pop" />}
                        </button>
                        <div className="flex-1" onClick={() => !task.isCompleted && setEditingTask(task)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                                        Pay {getCurrencySymbol('BDT')}{task.amount.toLocaleString('en-IN')}
                                    </p>
                                    <p className={`text-sm ${task.isCompleted ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                                        To: {task.recipient.name}
                                    </p>
                                </div>
                                {task.recurrence && (
                                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${task.isCompleted ? 'bg-secondary text-muted-foreground' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'}`}>
                                        {task.recurrence}
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                                <p>Due: <span className={!task.isCompleted && new Date(task.nextDueDate) < new Date() ? 'text-destructive font-semibold' : ''}>{new Date(task.nextDueDate).toLocaleDateString()}</span></p>
                                {task.notes && <p className="mt-1 italic">Note: {task.notes}</p>}
                            </div>
                        </div>
                        {!task.isCompleted && (
                            <div className="text-muted-foreground touch-none self-center" aria-label="Drag to reorder">
                                <GripVertical />
                            </div>
                        )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecurringTasksScreen;