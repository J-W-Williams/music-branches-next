import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [loggedInUser, setLoggedInUser] = useState(
      localStorage.getItem('loggedInUser') || null
  );

 
  const [selectedProject, setSelectedProject] = useState(
    localStorage.getItem('selectedProject') || 'No project selected'
  ); 

  const [userProjects, setUserProjects] = useState({});

  // Fetch user projects from MongoDB to populate dropdown
  useEffect(() => {
    
    const fetchUserProjects = async () => {
      try {
        // fetch
        const response = await fetch('/api/get-user-projects', {
          method: 'GET',
          headers: {
            //
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserProjects(data);
          // see if there's a currently selected project in localStorage.
          const storedSelectedProject = localStorage.getItem('selectedProject');
          if (storedSelectedProject) {
            setSelectedProject(storedSelectedProject);
          }
        } else {
        
          console.error('Failed to fetch user projects:', response.status);
        }
      } catch (error) {
        
        console.error('Error fetching user projects:', error);
      }
    };

      fetchUserProjects();
 
  }, []);


  const handleProjectChange = (event) => {
    const projectValue = event.target.value;
    setSelectedProject(projectValue);   
    localStorage.setItem('selectedProject', projectValue);
  };
  
  const login = (user) => {
    setLoggedInUser(user);
    localStorage.setItem('loggedInUser', user);
  };

  const logout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('selectedProject');
    setLoggedInUser(null);
    // setSelectedProject("No project selected");
    setSelectedProject(null);
  };

  const createProject = (user, projectName) => {
    const newProject = { id: userProjects[user].length + 1, name: projectName };
    setUserProjects((prevProjects) => ({
      ...prevProjects,
      [user]: [...prevProjects[user], newProject],
    }));
  };

  return (
    <UserContext.Provider value={{ loggedInUser, login, logout, userProjects, createProject, selectedProject,
        setSelectedProject, handleProjectChange }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);