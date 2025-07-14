import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(localStorage.getItem('selectedProject') || 'No project selected');
  const [userProjects, setUserProjects] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.sub; // use this to identify users in your DB
      const userEmail = user.email;
      setLoggedInUser(userId);
      localStorage.setItem('loggedInUser', userId);
      localStorage.setItem('userEmail', userEmail);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!loggedInUser) return;
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('/api/get-user-projects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-user-id': loggedInUser,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserProjects(data);
        } else {
          console.error('Failed to fetch user projects');
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchUserProjects();
  }, [loggedInUser, getAccessTokenSilently]);

  const logout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('selectedProject');
    setSelectedProject(null);
  };

  const createProject = (user, projectName) => {
    const newProject = { id: userProjects[user]?.length + 1 || 1, name: projectName };
    setUserProjects((prevProjects) => ({
      ...prevProjects,
      [user]: [...(prevProjects[user] || []), newProject],
    }));
  };

  return (
    <UserContext.Provider
      value={{
        loggedInUser,
        userProjects,
        selectedProject,
        setSelectedProject,
        logout,
        createProject,
        handleProjectChange: (e) => {
          const val = e.target.value;
          setSelectedProject(val);
          localStorage.setItem('selectedProject', val);
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);