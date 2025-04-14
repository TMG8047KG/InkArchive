import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import ForumCategory from "../components/forumcategory";
import SearchBar from "../components/searchbar";
import ProfileBar from "../components/profilebar";
import styles from "../styles/Forum.module.css";
import CreatedThread from "../components/createdthread";

const Forum = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [thread, setThread] = useState([]);
  const [owner, setOwner] = useState([]);
  const pathname = useLocation().pathname.split("/");
  const id = pathname[pathname.length-1];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    const thread = async () => {
        try{
          const threadResponse = await fetch(`http://localhost:5000/forum/thread/${id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
          });
          const threadJson = await threadResponse.json();
          setThread(threadJson);
          console.log(threadJson);
          const ownerResponse = await fetch(`http://localhost:5000/api/user/${threadJson.owner}`, {
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
    thread();
  }, []);

  const handleSearch = (query) => {
    console.log("Search query:", query);
  };

  return (
    <div className={styles.forumContainer}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <SearchBar onSearch={handleSearch} />
          <ProfileBar username={user ? user.username : null} 
            profilePic={user ? user.profilePicture : null} 
            isGuest={user && user.role === 'guest'} />
        </div>
        <CreatedThread thread={thread} owner={owner} />
      </div>
    </div>
  );
};

export default Forum;