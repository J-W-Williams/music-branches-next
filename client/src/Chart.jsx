import styled from "styled-components";
import { useLocation } from 'react-router-dom';

const Chart = () => {
       
  const { state } = useLocation();
  const id = state.id;

  return (
    <Wrapper>     
      <div>
        <Title>Create Chart!</Title>     
      </div>
      <MyAudio controls>
        <source src={id} type="audio/webm" />
      </MyAudio>
      <FrameHolder>
        <FrameWrapper src="https://glistening-dango-ad65f2.netlify.app/"></FrameWrapper>
      </FrameHolder>
    </Wrapper>
  )
}

const MyAudio = styled.audio`
    width: 100%;
 
`
const FrameHolder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
 
`

const FrameWrapper = styled.iframe`
    padding-top: 20px;
    width: 80%;
    height: 200vh;
    overflow: hidden;
    border: 1px solid white;
    margin: 10px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
`

const Wrapper = styled.div`
    text-align: left;
    min-height: 200vh;
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

export default Chart;