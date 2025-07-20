import { render } from 'preact';
import { App } from './App';
import { ThemeProvider } from './components/ThemeProvider';

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  document.getElementById('app')
);