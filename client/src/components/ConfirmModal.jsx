import styled from "styled-components";

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
  
    return (
      <Modal>
        <ModalContent>
          <p>{message}</p>
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </ModalContent>
      </Modal>
    );
  };

const Modal = styled.div`
    
`

const ModalContent = styled.div`
    

`

export default ConfirmModal;