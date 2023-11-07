import styled, {keyframes} from "styled-components";

const LoadingSpinner = () => {
        
  return (
    <LoaderContainer>
        <Spinner />
    </LoaderContainer>
  )
}

const SpinAnimation = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg);}
`

const LoaderContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  background: rgba(0, 0, 0, 0.834);
  z-index: 1;
`

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 8px solid;
  border-color: #3d5af1 transparent #3d5af1 transparent;
  border-radius: 50%;
  animation-name: ${SpinAnimation};
  animation-duration: 8s;
  animation-iteration-count: infinite;
`

export default LoadingSpinner;