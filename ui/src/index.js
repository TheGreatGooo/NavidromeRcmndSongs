import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './Layout';
import Settings from './Settings';
import Recommendations from './Recomendations';
console.log("Navidrome starting...")
import 'bootstrap/dist/css/bootstrap.min.css';
import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter([
    {
        path: "/",
        element: <Layout>test</Layout>,
    },
    {
        path: "settings",
        element: <Layout><Settings/></Layout>,
    },
    {
        path: "recommendations",
        element: <Layout><Recommendations/></Layout>,
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

