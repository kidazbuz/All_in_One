import { ChangeDetectionStrategy, Component, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

// --- Data Interfaces (Mirroring DRF Model Structure) ---
interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'INP' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'L' | 'M' | 'H' | 'C';
  estimatedHours: number;
  assignedTo: string;
}

interface Feature {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'INP' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'L' | 'M' | 'H' | 'C';
  assignedTo: string;
  tasks: Task[];
}

interface Release {
  id: number;
  versionName: string;
  startDate: string;
  dueDate: string;
  features: Feature[];
}

interface Project {
  id: number;
  name: string;
  releases: Release[];
}

// --- Status & Priority Mappers (For UI Display) ---

const STATUS_MAP = {
  'TODO': { text: 'To Do', color: 'bg-gray-200 text-gray-700' },
  'INP': { text: 'In Progress', color: 'bg-blue-200 text-blue-700' },
  'REVIEW': { text: 'In Review', color: 'bg-yellow-200 text-yellow-700' },
  'DONE': { text: 'Done', color: 'bg-green-200 text-green-700' },
  'BLOCKED': { text: 'Blocked', color: 'bg-red-200 text-red-700' }
};

const PRIORITY_MAP = {
  'L': { text: 'Low', color: 'bg-green-500' },
  'M': { text: 'Medium', color: 'bg-yellow-500' },
  'H': { text: 'High', color: 'bg-orange-500' },
  'C': { text: 'Critical', color: 'bg-red-500' }
};

// --- Mock Data ---

const MOCK_PROJECT_DATA: Project = {
  id: 1,
  name: 'Gemini Canvas App',
  releases: [
    {
      id: 101,
      versionName: 'v2.1.0 (Real-Time Collaboration)',
      startDate: '2025-01-10',
      dueDate: '2025-03-01',
      features: [
        {
          id: 201,
          title: 'Implement Multi-User Firestore Sync',
          description: 'Enable real-time synchronization of project data using Firestore listeners.',
          status: 'REVIEW',
          priority: 'C',
          assignedTo: 'Jane Doe',
          tasks: [
            { id: 301, title: 'Setup Firestore SDK and Auth', status: 'DONE', priority: 'M', estimatedHours: 8, assignedTo: 'Jane Doe' },
            { id: 302, title: 'Write `onSnapshot` listener for Task updates', status: 'INP', priority: 'H', estimatedHours: 12, assignedTo: 'Jane Doe' },
            { id: 303, title: 'Handle permission conflicts', status: 'TODO', priority: 'H', estimatedHours: 6, assignedTo: 'John Smith' },
          ]
        },
        {
          id: 202,
          title: 'Dark Mode UI/UX Design',
          description: 'Design and implement a complete dark mode theme using Tailwind CSS utilities.',
          status: 'INP',
          priority: 'M',
          assignedTo: 'John Smith',
          tasks: [
            { id: 304, title: 'Define dark color palette', status: 'DONE', priority: 'M', estimatedHours: 4, assignedTo: 'John Smith' },
            { id: 305, title: 'Apply utility classes to main components', status: 'INP', priority: 'M', estimatedHours: 20, assignedTo: 'John Smith' },
          ]
        }
      ]
    },
    {
      id: 102,
      versionName: 'v2.2.0 (Analytics Module)',
      startDate: '2025-03-05',
      dueDate: '2025-04-15',
      features: [
        {
          id: 203,
          title: 'Usage Tracking Implementation',
          description: 'Add logging for component interactions and user activity.',
          status: 'TODO',
          priority: 'H',
          assignedTo: 'Jane Doe',
          tasks: []
        }
      ]
    }
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <header class="mb-8 border-b pb-4">
        <h1 class="text-3xl font-extrabold text-blue-700">{{ project().name }} Management Dashboard</h1>
        <p class="text-gray-500">Track releases, features, and tasks for the current software project.</p>
      </header>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <p class="text-sm font-medium text-gray-500">Total Features</p>
          <p class="text-3xl font-bold text-gray-900">{{ totalFeatures() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <p class="text-sm font-medium text-gray-500">In Progress Tasks</p>
          <p class="text-3xl font-bold text-gray-900">{{ tasksInProgress() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <p class="text-sm font-medium text-gray-500">Completion Rate</p>
          <p class="text-3xl font-bold text-gray-900">{{ completionRate() | number: '1.0-0' }}%</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <p class="text-sm font-medium text-gray-500">High Priority</p>
          <p class="text-3xl font-bold text-gray-900">{{ highPriorityTasks() }} Tasks</p>
        </div>
      </div>

      <!-- Release Tracking Section -->
      <div class="space-y-12">
        @for (release of project().releases; track release.id) {
          <div class="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6">
              <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.5-7.5a.5.5 0 000 1h7a.5.5 0 000-1h-7z" clip-rule="evenodd" />
                </svg>
                Release: {{ release.versionName }}
              </h2>
              <div class="mt-2 sm:mt-0 text-sm text-gray-600 space-x-4">
                <span class="inline-block px-3 py-1 bg-gray-100 rounded-full">Start: {{ release.startDate | date }}</span>
                <span class="inline-block px-3 py-1 font-semibold"
                      [ngClass]="getDueDateClass(release.dueDate)">
                      Due: {{ release.dueDate | date }}
                </span>
              </div>
            </div>

            <!-- Features List (Accordion Style) -->
            <div class="space-y-4">
              @for (feature of release.features; track feature.id) {
                <details class="group border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-300" [open]="feature.status !== 'DONE'">
                  <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <span class="font-semibold text-gray-700">{{ feature.title }}</span>
                      <span class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                            [ngClass]="getStatusColor(feature.status)">
                            {{ getStatusText(feature.status) }}
                      </span>
                      <span class="w-2 h-2 rounded-full"
                            [ngClass]="getPriorityColor(feature.priority)"
                            title="Priority: {{ getPriorityText(feature.priority) }}">
                      </span>
                    </div>
                    <div class="text-sm text-gray-500 flex items-center space-x-4">
                        <span class="hidden sm:inline-block">Assigned to: <span class="font-medium text-gray-700">{{ feature.assignedTo }}</span></span>
                        <svg class="h-5 w-5 transform transition-transform duration-200 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </div>
                  </summary>

                  <div class="p-4 border-t border-gray-200 bg-white">
                    <p class="text-sm text-gray-600 mb-4">{{ feature.description }}</p>

                    <!-- Tasks Kanban/List -->
                    <h4 class="text-md font-semibold mb-3 text-gray-700">Sub-Tasks ({{ feature.tasks.length }})</h4>
                    <ul class="space-y-2">
                      @for (task of feature.tasks; track task.id) {
                        <li class="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                          <div class="flex items-center space-x-3">
                            <span class="text-sm font-medium text-gray-800">{{ task.title }}</span>
                            <span class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                                  [ngClass]="getStatusColor(task.status)">
                                  {{ getStatusText(task.status) }}
                            </span>
                          </div>
                          <div class="flex items-center space-x-3 text-xs text-gray-500">
                            <span class="w-2 h-2 rounded-full"
                                  [ngClass]="getPriorityColor(task.priority)">
                            </span>
                            <span>{{ task.estimatedHours }} hrs</span>
                            <span>({{ task.assignedTo }})</span>
                          </div>
                        </li>
                      } @empty {
                         <p class="text-gray-400 italic text-sm">No tasks defined for this feature yet.</p>
                      }
                    </ul>
                  </div>
                </details>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center p-10 bg-white rounded-xl shadow-lg">
            <p class="text-lg text-gray-500">No active releases found for this project.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .font-sans {
        font-family: 'Inter', sans-serif;
      }
      /* Custom style for the Priority circle */
      .w-2 { width: 0.5rem; }
      .h-2 { height: 0.5rem; }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class App {
  // Mock data structure managed by a signal (in a real app, this comes from the DRF API)
  project = signal<Project>(MOCK_PROJECT_DATA);

  // --- Computed Metrics (for the dashboard stats) ---

  // Computed signal to calculate all tasks across the project
  allTasks = computed<Task[]>(() =>
    this.project().releases.flatMap(release =>
      release.features.flatMap(feature => feature.tasks)
    )
  );

  // Total features count
  totalFeatures = computed<number>(() =>
    this.project().releases.flatMap(release => release.features).length
  );

  // Tasks In Progress count
  tasksInProgress = computed<number>(() =>
    this.allTasks().filter(task => task.status === 'INP').length
  );

  // High Priority Tasks (High or Critical)
  highPriorityTasks = computed<number>(() =>
    this.allTasks().filter(task => task.priority === 'H' || task.priority === 'C').length
  );

  // Calculate completion rate based on tasks
  completionRate = computed<number>(() => {
    const tasks = this.allTasks();
    if (tasks.length === 0) return 0;
    const doneTasks = tasks.filter(task => task.status === 'DONE').length;
    return (doneTasks / tasks.length) * 100;
  });

  // --- Utility Methods for UI Styling ---

  getStatusColor(status: keyof typeof STATUS_MAP): string {
    return STATUS_MAP[status]?.color || 'bg-gray-100 text-gray-500';
  }

  getStatusText(status: keyof typeof STATUS_MAP): string {
    return STATUS_MAP[status]?.text || 'Unknown';
  }

  getPriorityColor(priority: keyof typeof PRIORITY_MAP): string {
    return PRIORITY_MAP[priority]?.color || 'bg-gray-400';
  }

  getPriorityText(priority: keyof typeof PRIORITY_MAP): string {
    return PRIORITY_MAP[priority]?.text || 'N/A';
  }

  getDueDateClass(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    if (due < today) {
      return 'bg-red-100 text-red-700 font-bold'; // Overdue
    } else if (due.getTime() - today.getTime() <= (7 * 24 * 60 * 60 * 1000)) {
      return 'bg-orange-100 text-orange-700'; // Due soon (within 7 days)
    } else {
      return 'bg-blue-100 text-blue-700'; // On track
    }
  }
}
