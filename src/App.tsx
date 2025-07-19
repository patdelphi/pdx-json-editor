import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { AppLayout } from './components/Layout/AppLayout';
import { Router } from './router/Router';
import { EditorContainer } from './components/Editor/EditorContainer';
import './app.css';

// Placeholder components for routes
function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">PDX JSON Editor</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Welcome to the PDX JSON Editor. Ready to edit your JSON files.
        </p>
        <a 
          href="/editor" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Editing
        </a>
      </div>
    </div>
  );
}

function EditorPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <EditorContainer />
    </div>
  );
}

const routes = [
  { path: '/', component: HomePage },
  { path: '/editor', component: EditorPage },
];

export function App() {
  return (
    <ErrorBoundary>
      <AppLayout>
        <Router routes={routes} />
      </AppLayout>
    </ErrorBoundary>
  );
}
