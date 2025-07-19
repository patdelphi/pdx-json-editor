import { render } from 'preact'
import './index.css'
import { App } from './App.tsx'
import { initializeTheme } from './utils/theme'

// Initialize theme before rendering to prevent flash
initializeTheme();

render(<App />, document.getElementById('app')!)
