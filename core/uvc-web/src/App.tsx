import './App.css';
import { BrowserRouter } from 'react-router-dom';
import SVHRouter from './layouts/SVHRouter';

const App = () => {
    return (
        <BrowserRouter>
            <SVHRouter />
        </BrowserRouter>
    );
};

export default App;
