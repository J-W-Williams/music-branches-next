// import { useAuth0 } from '@auth0/auth0-react';
// import { useUserContext } from './context/UserContext';
// import { styled } from 'styled-components';

// const Login = () => {
//   const { login } = useUserContext();

//   const handleLogin = (user) => {
//     login(user);
//   };

//   return (
//     <Wrapper>
//       <Title>Welcome to Music Branches</Title>
//       <MainText>A place for all of your music ideas</MainText>
//       <MyButton onClick={() => handleLogin('user1')}>Login as User 1</MyButton>
//       <MyButton onClick={() => handleLogin('user2')}>Login as User 2</MyButton>
//     </Wrapper>
//   );
// };

import { useAuth0 } from '@auth0/auth0-react';
import { styled } from 'styled-components';

const Login = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <Wrapper>
      <Title>Welcome to Music Branches</Title>
      <MainText>A place for all of your music ideas</MainText>

      {!isAuthenticated ? (
        <MyButton onClick={() => loginWithRedirect()}>Log In</MyButton>
      ) : (
        <>
          <p>Welcome, {user.name}</p>
          <MyButton onClick={() => logout({ returnTo: window.location.origin })}>Log Out</MyButton>
        </>
      )}
    </Wrapper>
  );
};


const Title = styled.div`
  font-family: 'Sirin Stencil', cursive;
  font-size: 74px;
  color: white;
  padding: 20px;
`

const MainText = styled.div`
  font-family: 'Thasadith', sans-serif;
  font-size: 28px;
  color: white;
  margin-bottom: 20px;
`

const MyButton = styled.button`
  width: 128px;
  height: 35px;
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  background-color: #0d1117;
  text-decoration: none;
  padding: 20px;
  height: 100vh;
  margin: 0;
`

export default Login;
