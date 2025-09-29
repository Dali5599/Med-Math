
import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import { VaultProvider } from './contexts/VaultContext';
import routes from './router/config';
import './i18n';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <VaultProvider>
        <div className="dark">
          <AppRoutes />
        </div>
      </VaultProvider>
    </BrowserRouter>
  );
}

export default App;
