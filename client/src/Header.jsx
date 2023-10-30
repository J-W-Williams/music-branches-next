import { useState } from 'react'
import styled from "styled-components";
import { useUserContext } from './context/UserContext';
import { Link } from 'react-router-dom';

const Header = () => {

  const { loggedInUser, logout, createProject, userProjects, selectedProject, setSelectedProject } = useUserContext();
  const [newProjectName, setNewProjectName] = useState('');

  const handleNewProjectChange = (event) => {
    setNewProjectName(event.target.value);
  };

  const handleNewProjectSubmit = (event) => {
    event.preventDefault();
    if (newProjectName) {
      createProject(loggedInUser, newProjectName);
      setNewProjectName('');
    }
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
    localStorage.setItem('selectedProject', event.target.value);
  };

  return (
    <>
    <Wrapper>
      {loggedInUser && (
        <>      
        <Users>                       
          {userProjects[loggedInUser] ? (
             <MySelect onChange={handleProjectChange} value={selectedProject || ""}>
              <option value="" disabled>
                Select Project
              </option>
              {userProjects[loggedInUser] ? (
                userProjects[loggedInUser].map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name}
                  </option>
                ))
              ) : (
              <option value="" disabled>Loading projects...</option>
              )}
            </MySelect>
          ) : (
            <p>Loading projects...</p>
          )}
        </Users>
          
        <Users>
          <MyForm onSubmit={handleNewProjectSubmit}>
            <MyInput
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={handleNewProjectChange}
            />
            <LogoutButton type="submit">Create New</LogoutButton>
          </MyForm>  
        </Users>
        </>
      )}
        <Title>
          <MyLink to="/dashboard">Music Branches</MyLink>
        </Title>  
        <Navigation>
          <MyLink to="/"><LinkText>Audio Recorder</LinkText></MyLink>
          <MyLink to="/collection"><LinkText>Audio Collection</LinkText></MyLink>
          <MyLink to="/sheet-music"><LinkText>Sheet Music</LinkText></MyLink>  
        </Navigation>     
        <Users>
          <div>Welcome, {loggedInUser}!</div>
          <LogoutButton onClick={logout}>Logout</LogoutButton>   
        </Users> 
    </Wrapper>
    <Line></Line>
    </>
  )
}

const MyForm = styled.form`
  display: flex;
  flex-direction: column;
`

const MyInput = styled.input`
  width: 84px;
  height: 20px;
  background-color: #202124;
  color: white;
  font-family: 'Thasadith', sans-serif;
  font-size: 14px;
  border-radius: 5px;
  transition: all ease 400ms;
  &:hover {
  background-color: #171b20;
  }
`

const MySelect = styled.select`
  background-color: #202124;
  color: white;
  font-family: 'Thasadith', sans-serif;
  font-size: 18px;
  border-radius: 10px;
  transition: all ease 400ms;
  &:hover {
    background-color: #171b20;
  }
`

const Title = styled.div`
  font-family: 'Sirin Stencil', cursive;
  font-size: 50px;
  text-decoration: none;
  color: white;
  transition: all ease 400ms;
  &:hover {
    transform: scale(1.1);
  }
`

const MyLink = styled(Link)`
  text-decoration: none;
  color: white;
  cursor: pointer;
  transition: all ease 400ms;
  &:hover {
    transform: scale(1.1);
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  background-color: #0d1117;
  text-decoration: none;
  padding: 20px;
`

const Users = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Thasadith', sans-serif;
`

const LogoutButton = styled.button`
  width: 110px;
  border-radius: 5px;
  font-family: 'Thasadith', sans-serif;
  font-size: 12px;
  font-weight: 700;
  background-color: #1f6feb;
  color: #fbfffe; 
  cursor: pointer;
  transition: all ease 400ms;
  &:hover {
    transform: scale(1.05);
    background-color: #388bfd;
}
`

const LinkText = styled.div`
  padding: 5px;
  color: white;
  font-family: 'Thasadith', sans-serif;
  /* font-weight: 700; */
  text-decoration: none;
`

const Navigation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  text-decoration: none;
`

const Line = styled.div`
    border-bottom: 1px solid #22272d;
`

export default Header;