import React, { useEffect, useState } from 'react';
import styles from './styles/forumthread.module.css';
import defaultAvatar from '../assets/noicon.png';
import { useNavigate } from 'react-router-dom';
import PostInput from './postcomment.jsx';


const ForumThread = ({ id, title, ownerId, category }) => {
  const [owner, setOwner] = useState([]);
  const navigate = useNavigate();
  useEffect(()=>{
    const user = async () => {
      try{
        const ownerResponse = await fetch(`http://localhost:5000/api/user/${ownerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setOwner(await ownerResponse.json());
      }catch(err){
        console.log(err);
      }
    }
    user();
  },[])

  const handleOpenThread = () => {
    navigate(`/forum/${category}/${id}`)
  }
  return (
    <div className={styles.threadContainer} onClick={handleOpenThread}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.userInfo}>
        <span className={styles.username}>{owner.username}</span>
        <img
          src={owner.profilePicture && owner.profilePicture.startsWith('/uploads') 
            ? `http://localhost:5000${owner.profilePicture}` 
            : defaultAvatar}
          alt="User avatar"
          className={styles.avatar}
        />
      </div>
    </div>
  );
};

export default ForumThread;