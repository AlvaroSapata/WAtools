import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { JobsListPage } from './pages/jobs/JobsListPage';
import { CreateJobPage } from './pages/jobs/CreateJobPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { EditJobPage } from './pages/jobs/EditJobPage';
import { ToolsListPage } from './pages/tools/ToolsListPage';
import { CreateToolPage } from './pages/tools/CreateToolPage';
import { ToolDetailPage } from './pages/tools/ToolDetailPage';
import { EditToolPage } from './pages/tools/EditToolPage';
import { initializeDatabase } from './services/database';

function App() {
  useEffect(() => {
    // Initialize the database when the app starts
    initializeDatabase();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsListPage />} />
            <Route path="/jobs/new" element={<CreateJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/:id/edit" element={<EditJobPage />} />
            <Route path="/tools" element={<ToolsListPage />} />
            <Route path="/tools/new" element={<CreateToolPage />} />
            <Route path="/tools/:id" element={<ToolDetailPage />} />
            <Route path="/tools/:id/edit" element={<EditToolPage />} />
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;