import React, { useEffect, useState } from 'react';
import styles from './styles/createdthread.module.css';
import defaultPic from '../../src/assets/noicon.png';
import PostInput from './postcomment';
import Commentblock from './comment';
import { useLocation, useNavigate } from 'react-router-dom';

const CreatedThread = ({ thread, owner }) => {
  const navigator = useNavigate();
  const [user, setUser] = useState([]);
  const [comments, setComments] = useState([]);
  const pathname = useLocation().pathname.split("/");

  const fetchComments = async () => {
    console.log(thread._id);
    try {
      const commentList = await fetch(`http://localhost:5000/forum/${thread._id}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const com = await commentList.json();
      console.log(com);
      setComments(com);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteThread = async () => {
    try {
      const commentList = await fetch(`http://localhost:5000/forum/delete-thread/${thread._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      navigator(`/forum/${pathname[pathname.length-2]}`);
      console.log(await commentList.json());
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchComments();
  }, [thread]);

  return (
    <div className={styles.threadContainer}>
      <div className={styles.header}>
        <img
          src={owner.profilePicture && owner.profilePicture.startsWith('/uploads') 
            ? `http://localhost:5000${owner.profilePicture}` 
            : defaultPic}
          alt="User Avatar"
          className={styles.avatar}
        />
        <div className={styles.threadInfo}>
          <h2 className={styles.threadTitle}>{thread.title}</h2>
          <p className={styles.username}>by {owner.username}</p>
        </div>
        <div>
          {user._id === owner._id ? <div className={styles.deleteBtn} onClick={handleDeleteThread}>Delete Thread</div> : ""}
        </div>
      </div>
      <div className={styles.contentBox}>
        <p className={styles.content}>{thread.content}</p>
      </div>

      <div className={styles.commentDivider}>
        <hr className={styles.line} />
        <span className={styles.commentLabel}>Comments</span>
        <hr className={styles.line} />
      </div>
      {comments.length > 0 ? comments.map((comment) => (
        <Commentblock userId={comment.owner} text={comment.content} />
      )) : <p>No comments, yet!</p>}
      <PostInput refreshComments={fetchComments}/>
    </div>
  );
};

export default CreatedThread;