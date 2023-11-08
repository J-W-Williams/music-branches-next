import { useState } from 'react';
import Tag from './Tag';
import { styled } from 'styled-components';

const TagManager = ({ resource, onUpdateTags, onDeleteTag }) => {
    const [tagsInput, setTagsInput] = useState('');
  
    const handleTagsInputChange = (e) => {
      setTagsInput(e.target.value);
    };
  
    const handleAddTags = () => {
      const newTags = tagsInput.split(',').map((tag) => tag.trim());
      onUpdateTags(resource, newTags); // Pass newTags only
      setTagsInput('');
    };
  
    return (
      <Wrapper>
        {/* <MainText><BoldSpan>Tags: </BoldSpan>(tap to edit) </MainText> */}
        <TagList>
          {resource.tags.map((tag, index) => (
            <Tag key={index} tag={tag} onDelete={() => onDeleteTag(tag, resource.public_id)} />
          ))}
        </TagList>
        <MyInput
          type="text"
          placeholder="Add tags (comma-separated)"
          value={tagsInput}
          onChange={handleTagsInputChange}
        />
        <MyButton onClick={handleAddTags}>Add new tags</MyButton>
      </Wrapper>
    );
  };
  

  const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

  `

  const TagList = styled.ul`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 380px;

  `
const MainText = styled.div`
font-family: 'Thasadith', sans-serif;
font-size: 16px;
color: white;
`
const BoldSpan = styled.span`
  font-weight: 700;
`

  const MyInput = styled.textarea`
  width: 380px;  
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

const MyButton = styled.button`
  width: 385px;
  height: 30px;
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

export default TagManager;
