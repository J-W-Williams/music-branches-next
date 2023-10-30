import { useState, useEffect } from 'react'
import { useUserContext } from './context/UserContext';
import { styled } from 'styled-components';
import { Link } from 'react-router-dom';

const Dashboard = () => {

  const { loggedInUser, logout, selectedProject } = useUserContext();
  const [audioResources, setAudioResources] = useState([]);
  const [imageResources, setImageResources] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  // controls for modal when viewing full-screen image
  const openModal = image => {
    setActiveImage(image);
  };

  const closeModal = () => {
    setActiveImage(null);
  }; 

  useEffect(() => {

    // load both audio & image data for current user/project
    // then get all tags to populate Tag Cloud
    async function fetchResourcesAndTags() {
      try {
    
        const audioResponse = await fetch(`/api/get-audio?user=${loggedInUser}&project=${selectedProject}`);
        const imageResponse = await fetch(`/api/get-images?user=${loggedInUser}&project=${selectedProject}`);
        
        const audioData = await audioResponse.json();
        const imageData = await imageResponse.json();
        
        if (audioResponse.status === 200) {
          if (audioData.message === `No audio found for this user/project combination`) {
            setAudioResources([]);
          } else {
            setAudioResources(audioData);
          }
        } else {
          console.error('Error fetching audio resources:', audioData.message);
        }
        
        if (imageResponse.status === 200) {
          if (imageData.message === `No images found for this user/project combination`) {
            setImageResources([]);
          } else {
            setImageResources(imageData);
          }
        } else {
          console.error('Error fetching image resources:', imageData.message);
        }
        
        const tagsResponse = await fetch(`/api/get-all-tags?user=${loggedInUser}&project=${selectedProject}`);
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData);
        } else {
          console.error('Failed to fetch tags:', tagsResponse.status);
        }
      } catch (error) {
        console.error('Error fetching resources and tags:', error);
      }
    }
  
    fetchResourcesAndTags();
  }, [selectedProject, loggedInUser]);
  

  // when user clicks on a specific tag in the Tag Cloud
  // return both the audio and image elements associated with this tag
  const filteredAudioResources = audioResources.length > 0
  ? audioResources.filter((resource) => resource.tags.includes(selectedTag))
  : [];

  const filteredImageResources = imageResources.length > 0
  ? imageResources.filter((resource) => resource.tags.includes(selectedTag))
  : [];

  
  return (
    <Wrapper>
      <Title>
        Dashboard!
      </Title>
      
      <MyLink to="/collection"> <MainText>Current audio clips {audioResources.length}</MainText> </MyLink>
      <MyLink to="/sheet-music"> <MainText>Sheet music collection {imageResources.length}</MainText> </MyLink>
  
      <Title>Tag Cloud</Title>

      <TagCloudHolder>
        {tags.map((tag) => (
          <SingleTag key={tag} onClick={() => setSelectedTag(tag)}>
            {tag}
          </SingleTag>
        ))}
      </TagCloudHolder>

      <MediaResourceHolder>   
        {filteredImageResources.map((resource, index) => (
          <div key={resource.id + index}>
            <Thumbnail src={resource.secure_url} alt={resource.public_id} onClick={() => openModal(resource)} />
          </div>
        ))} 
      </MediaResourceHolder>   

      <MediaResourceHolder>    
        {filteredAudioResources.map((resource, index) => (
          <div key={resource.id + index}>
            <audio controls>
              <source src={resource.secure_url} type="audio/webm" />
            </audio>   
          </div>
        ))}
      </MediaResourceHolder> 

      {activeImage && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent>
            <FullsizeImage src={activeImage.secure_url} alt={activeImage.public_id} />
          </ModalContent>
        </ModalOverlay>
      )}

    </Wrapper>
  )
}


const MediaResourceHolder = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin: 20px;
`

const TagCloudHolder = styled.div`
  width: 480px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`

const SingleTag = styled.button` 
  font-family: 'Thasadith', sans-serif;
  font-size: 18px;
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
const Wrapper = styled.div`
    background-color: #0d1117;
    height: 200vh;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const MainText = styled.div`
  font-family: 'Thasadith', sans-serif;
  font-size: 18px;
  color: white;
  padding-top: 15px;
  text-decoration: none;
`

const Title = styled.div`
  font-family: 'Sirin Stencil', cursive;
  font-size: 34px;
  color: white;
  padding: 20px;
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

const Thumbnail = styled.img`   
  height: 200px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  margin: 20px;
  transition: all ease 400ms;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
`

const FullsizeImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
`

export default Dashboard;