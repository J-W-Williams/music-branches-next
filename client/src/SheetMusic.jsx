import { useState, useEffect } from 'react'
import styled from "styled-components";
import { useUserContext } from './context/UserContext';
import TagManager from './components/TagManager';

const SheetMusic = () => {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const handleSelectFile = (e) => setFile(e.target.files[0]);
    const [tags, setTags] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const { loggedInUser, selectedProject } = useUserContext();
    const [imageResources, setImageResources] = useState([]);
    const [activeImage, setActiveImage] = useState(null);
    const [tagDeleted, setTagDeleted] = useState(false);
    const [tagUpdated, setTagUpdated] = useState(false);
    const [itemDeleted, setItemDeleted] = useState(false);
    const [sortImageBy, setSortImageBy] = useState('newest');
  
    // handle sorting of elements by date
    const sortImageResources = (resources) => {
      return resources.slice().sort((a, b) => {
        if (sortImageBy === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortImageBy === 'oldest') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
      });
    };
  
  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  // handle modal for full-screen image view
  const openModal = image => {
    setActiveImage(image);
  };

  const closeModal = () => {
    setActiveImage(null);
  };

  // display existing sheet music for the current user/project
  useEffect(() => {
    
    async function fetchImageResources() {
        try {
          const response = await fetch(`/api/get-images?user=${loggedInUser}&project=${selectedProject}`);
          const data = await response.json();
          if (response.status === 200) {              
            if (data.message === 'No sheet music found for this user/project combination') {
              setImageResources([]);
              setMessage('No sheet music yet!');
            } else {
              setImageResources(data);
              setMessage(''); 
            }
          } else {           
            console.error('Error fetching audio resources:', data.message);
          }
        } catch (error) {
          console.error('Error fetching resources:', error);
        }
      }      
      fetchImageResources();
  }, [selectedProject, tagDeleted, tagUpdated, itemDeleted]);

  const handleDeleteImageTag = async (tagToDelete, id) => {
    setTagDeleted(false);
    const collectionName = 'sheets';
    const response = await fetch(`/api/delete-tag/${encodeURIComponent(id)}/${encodeURIComponent(tagToDelete)}/${encodeURIComponent(collectionName)}`, {
      method: 'DELETE',
    });      
    console.log("response:", response);
    if (response.ok) {
      console.log("tag deleted");
      setTagDeleted(true);
    } else {
      // Handle error
    }
  };
  
  const updateImageTags = async (resource, newTags) => {
    const collectionName = 'sheets';
    setTagUpdated(false);
    if (newTags && newTags.length > 0) {
      const response = await fetch(`/api/update-tags/${collectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId: resource.public_id,
          tags: newTags,
        }),
      });
  
      if (response.ok) {
        console.log('tags updated.');
        
        setTagsInput('');
        setTagUpdated(true);
      } else {
        console.error('Failed to update tags', response.statusText);
      }
    }
  };

  const handleDestroy = async (resourceType, id) => {
    
    setItemDeleted(false);
    const response = await fetch(`/api/delete-resource/${resourceType}/${id}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      setItemDeleted(true);
    }
  };
  
  const handleUpload = async () => {
    try {      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('tags', tags);
      formData.append('user', loggedInUser);
      formData.append('project', selectedProject);

      const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,      
      });

      if (response.ok) {
          const data = await response.json();      
          setImageResources([...imageResources, data.cloudinaryResult]);                          
      } else {
          console.error('Failed to upload image', response.statusText);
      }
    } catch (error) {
        console.error('Error uploading image', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Your Sheet Music Collection!</Title>
      <p>{message}</p>     
      <UploaderContainer>
        <MyInput>        
          <CustomFileInput>
            <button>Select New Sheet Music To Upload</button>
            <input type="file" onChange={handleSelectFile} multiple={false}/>
          </CustomFileInput>
        </MyInput>       
        <MyTextArea value={tags}
            onChange={handleTagsChange}
            placeholder="Enter tags separated by commas">
        </MyTextArea>
      </UploaderContainer>

      <UploadButton onClick={handleUpload}>
          {loading ? "uploading..." : "Upload!"}
      </UploadButton>
        
      <Line></Line>

      <SortContainer> 
        <MainText>     
         Sort by:
        </MainText>   
        <SortButtonContainer>
          <SortButton
            onClick={() => setSortImageBy('newest')}
          >
            Newest
          </SortButton>
          <SortButton
            onClick={() => setSortImageBy('oldest')}
          >
            Oldest
          </SortButton>
        </SortButtonContainer>
      </SortContainer>     

      <GalleryWrapper>
        {sortImageResources(imageResources).map((image, index) => (
          <GalleryItem key={image.public_id + index}>
            <MainText>Date: {image.created_at}</MainText>
            <Thumbnail  src={image.secure_url} alt={image.public_id} onClick={() => openModal(image)} />          
            <TagManager
              resource={image}
              onUpdateTags={updateImageTags}
              onDeleteTag={handleDeleteImageTag}
              tagsInput={tagsInput} 
            />          
            <MyButton onClick={() => handleDestroy('image', image.public_id)}>Delete this item</MyButton>
          </GalleryItem>
        ))}
      </GalleryWrapper>

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

const GalleryWrapper = styled.div`
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  height: 100px;
  width: 100%;    
`

const SortContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const SortButtonContainer = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const GalleryItem = styled.div`
  background-color: #22272d;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px;
`

const UploadButton = styled.button`
  margin-top: 15px;
  width: 310px;
  height: 40px;
  border-radius: 5px;
  font-family: 'Thasadith', sans-serif;
  font-size: 14px; 
  background-color: #1f6feb;
  color: #fbfffe; 
  cursor: pointer;
  transition: all ease 400ms;
  &:hover {
    transform: scale(1.05);
    background-color: #388bfd;
  }
`

const MyButton = styled.button`
  margin-top: 15px;
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

const MyTextArea = styled.textarea`
  width: 260px;  
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

const MyInput = styled.div`
  background-color: #1f6feb;
  font-family: 'Thasadith', sans-serif;
  color:white;
  font-size: 14px;  
`

const Title = styled.div`
  font-family: 'Sirin Stencil', cursive;
  font-size: 34px;
  color: white;
  padding: 20px;
`

const SortButton = styled.button`
  border-radius: 5px;
  border: 1px solid #ccc;
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
  width: 80px;
  font-family: 'Thasadith', sans-serif;
  font-size: 14px;
  background-color: #1f6feb;
  color: #fbfffe; 
  border: none;
  &:hover {
    transform: scale(1.05);
    background-color: #388bfd;
  }
`;

const UploaderContainer = styled.div`
  display: flex;
  flex-direction: row;  
`

const CustomFileInput = styled.div`
  display: inline-block;
  position: relative;
  overflow: hidden;
  margin-right: 10px; 
  input[type='file'] {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  button {
    background-color: #1f6feb;
    color: #fbfffe;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-family: 'Thasadith', sans-serif;
    font-size: 14px;
    cursor: pointer;
  }
`;

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
`;

const ModalContent = styled.div`
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
`;

const FullsizeImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
`;

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
const MainText = styled.div`
  font-family: 'Thasadith', sans-serif;
  font-size: 18px;
  color: white;
  padding-top: 15px;
`

const Wrapper = styled.div`
  text-align: left;
  background-color: #0d1117;
  min-height: 200vh; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  .active {
    background-color: #5ca0d3;
    color: #fbfffe;
  }
`

const Line = styled.div`
  border-bottom: 1px solid #22272d;
  padding-top: 20px;
  padding-bottom: 10px;
`

export default SheetMusic;