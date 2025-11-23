import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import FactCheckTool from './FactChecker';
import ImageForensics from './ImageForensics';
import DocumentLab from './DocumentLab'; // <--- IMPORT THIS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tool/fact-check" element={<FactCheckTool />} />
        <Route path="/tool/image-forensics" element={<ImageForensics />} />
        
        {/* THIS ROUTE MUST EXIST FOR THE BUTTON TO WORK: */}
        <Route path="/tool/document-lab" element={<DocumentLab />} />
        
      </Routes>
    </Router>
  );
}

export default App;