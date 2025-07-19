import type { ComponentChildren } from 'preact';
import { Header } from './Header';
import { StatusBar } from './StatusBar';

interface AppLayoutProps {
  children: ComponentChildren;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full max-w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        {children}
      </main>
      <StatusBar />
    </div>
  );
}