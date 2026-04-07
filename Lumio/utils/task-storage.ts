import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '@/components/home/PlanGently';

const TASKS_KEY = '@lumio:plan_gently_tasks';

const defaultTasks: Task[] = [
  { id: '1', title: 'Take a short walk', priority: 'low', completed: false },
  { id: '2', title: 'Reply to Sarah', priority: 'medium', completed: false },
  { id: '3', title: 'Review project notes', priority: 'high', completed: true },
];

function parseTasks(raw: string | null): Task[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed)) return defaultTasks;
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.title === 'string' &&
        ['high', 'medium', 'low'].includes(t.priority)
    );
  } catch {
    return defaultTasks;
  }
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    const parsed = parseTasks(raw);
    return parsed.length > 0 ? parsed : defaultTasks;
  } catch {
    return defaultTasks;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('saveTasks', e);
  }
}
