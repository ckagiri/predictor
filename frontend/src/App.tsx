import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router-dom';
import Ligi from './root/Ligi';

const App = () => {
  const router = createBrowserRouter([
    {
      path: '*',
      element: <Ligi />,
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
