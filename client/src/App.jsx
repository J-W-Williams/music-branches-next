import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalStyles from './GlobalStyles';
import Header from './Header';
import HomePage from './HomePage';
import Collection from './Collection';
import SheetMusic from './SheetMusic';
import Dashboard from './Dashboard';
import Login from './Login';
import Transcription from './Transcription';
import Chart from './Chart';
import { useUserContext } from './context/UserContext';

const App = () => {

  const { loggedInUser, userProjects, selectedProject } = useUserContext();
  console.log("loggedInUser:", loggedInUser);

  return (
    <div>
      {!loggedInUser ? (
        <Login />
      ) : (
        <div>         
        <BrowserRouter>
        <GlobalStyles />
        <Header />    
         <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/login" element={<Login />} />
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/collection" element={<Collection />} />
           <Route path="/sheet-music" element={<SheetMusic />} />
           <Route path="/transcription" element={<Transcription />} /> 
           <Route path="/chart" element={<Chart />} />             
         </Routes>   
     </BrowserRouter>
        </div>
      )}
    </div>
  );

}

export default App;
