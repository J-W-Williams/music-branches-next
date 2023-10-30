import styled from "styled-components";
import { useLocation } from 'react-router-dom';

const Transcription = () => {
       
  const { state } = useLocation();
  const id = state.id;

  return (
    <Wrapper>     
      <div>
        <Title>Transcription!</Title>     
      </div>
      <MyAudio controls>
        <source src={id} type="audio/webm" />
      </MyAudio>
      <FrameHolder>
        <FrameWrapper src="https://deft-hamster-0ad592.netlify.app/"></FrameWrapper>
      </FrameHolder>
    </Wrapper>
  )
}

const FrameHolder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

`
const FrameWrapper = styled.iframe`
  width: 80%;
  height: 150vh;
  overflow: hidden;
  border: 1px solid white;
  margin: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
`
const MyAudio = styled.audio`
  width: 100%;
  padding-bottom:10px;
`

const Wrapper = styled.div`
  text-align: left;
`

const Title = styled.div`
  font-family: 'Sirin Stencil', cursive;
  font-size: 34px;
  color: white;
  padding: 20px;
  background-color: #0d1117;
`

const Line = styled.div`
  border-bottom: 1px solid black;
  padding-top: 20px;
  padding-bottom: 10px;
`

export default Transcription;