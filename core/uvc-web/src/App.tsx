import './App.css';
import { BrowserRouter } from 'react-router-dom';
import SVHRouter from './layouts/SVHRouter';
import SiteHostRouter from './layouts/SiteHostRouter';
import { getSiteSubdomainFromHost } from './utils/SiteHost';

const siteSubdomain = getSiteSubdomainFromHost();

const App = () => {
    return (
        <BrowserRouter>
            {siteSubdomain ? <SiteHostRouter subdomain={siteSubdomain} /> : <SVHRouter />}
        </BrowserRouter>
    );
};

export default App;
