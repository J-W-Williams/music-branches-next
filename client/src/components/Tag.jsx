import { useState } from 'react'
import { styled } from 'styled-components';

const Tag = ({ tag, onDelete }) => {
    const [showDeleteButton, setShowDeleteButton] = useState(false);
  
    const handleClick = () => {
      setShowDeleteButton(!showDeleteButton);
    };
  
    return (
      <MyButton className="tag" onClick={handleClick}>
        {tag}
        {showDeleteButton && (
          <XButton className="delete-button" onClick={() => onDelete(tag)}>
            X
          </XButton>
        )}
      </MyButton>
    );
  };

const MyButton = styled.div`
font-family: 'Thasadith', sans-serif;
  color:white;
  font-weight: 700;
    cursor: pointer;
    border: 1px solid #1f6feb;
    background: #121d2f;
    color: white;
    padding: 5px;
    margin: 5px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    width: 80px;
    &:hover {
    transform: scale(1.05);
    background-color: #388bfd;
  }
`

const XButton = styled.button`
    cursor: pointer;
    color: white;
    background:  #1f6feb;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    width: 20px;
    height: 20px;
    font-size: 14px;
    text-align: center;
    margin-left: 10px;
    padding-left:2px;
`

export default Tag;