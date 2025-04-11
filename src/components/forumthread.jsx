import React from 'react';
import styles from './styles/forumthread.module.css';
import defaultAvatar from '../assets/noicon.png';

const ForumThread = ({ title, owner }) => {
  return (
    <div className={styles.threadContainer}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.userInfo}>
        <img
          src={owner.profilePicture || defaultAvatar}
          alt="User avatar"
          className={styles.avatar}
        />
        <span className={styles.username}>{owner.username}</span>
      </div>
    </div>
  );
};

export default ForumThread;
