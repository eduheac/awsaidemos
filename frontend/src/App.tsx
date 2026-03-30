import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DemoList from './pages/DemoList';
import DemoDetail from './pages/DemoDetail';
import DemoForm from './pages/DemoForm';

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <Layout user={user} signOut={signOut}>
            <Routes>
              <Route path="/" element={<DemoList />} />
              <Route path="/demos/new" element={<DemoForm />} />
              <Route path="/demos/:demoId" element={<DemoDetail />} />
              <Route path="/demos/:demoId/edit" element={<DemoForm />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
