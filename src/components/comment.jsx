import React, { useEffect, useState } from 'react';
import styles from './styles/comment.module.css';
import defaultAvatar from '../assets/noicon.png';

const Comment = ({ userId, text }) => {
  const [owner, setOwner] = useState([]);
  useEffect(() => {  
    const commnet = async () => {
        try{
          const ownerResponse = await fetch(`http://localhost:5000/api/user/${userId}`, {
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
    commnet();
  }, []);
  return (
    <div className={styles.commentContainer}>
      <div className={styles.header}>
        <img
          src={owner.profilePicture && owner.profilePicture.startsWith('/uploads') 
            ? `http://localhost:5000${owner.profilePicture}` 
            : defaultAvatar}
          alt="User avatar"
          className={styles.avatar}
        />
        <span className={styles.username}>{owner.username}</span>
      </div>
      <div className={styles.textBox}>
        <p className={styles.text}>{text}</p>
      </div>
    </div>
  );
};

export default Comment;
