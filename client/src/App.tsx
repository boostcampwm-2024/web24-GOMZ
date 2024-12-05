import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from '@components/common/ProtectedRoute';
import Home from '@components/Home/Home';
import StudyRoomList from '@components/StudyRoomList/index';
import StudyRoom from '@components/StudyRoom/index';
import Permission from '@components/Permission/index';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/study-room-list',
    element: (
      <ProtectedRoute>
        <StudyRoomList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/study-room/:roomId',
    element: (
      <ProtectedRoute>
        <StudyRoom />
      </ProtectedRoute>
    ),
    errorElement: <Navigate to="/study-room-list" replace />,
  },
  {
    path: '/permission/:roomId/',
    element: (
      <ProtectedRoute>
        <Permission />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <div className="font-pretendard text-gomz-black selection:text-gomz-blue selection:bg-none">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
