import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { VideoPage } from './components/VideoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/video/:videoId" element={<VideoPage />} />
      </Routes>
    </Router>
  );
}

export default App;