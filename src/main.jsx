import { render } from 'preact';
import { App } from './App';
import './theme/theme.css';
import './theme/mobile.css';

render(<App />, document.getElementById('app'));