import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Post from './Post';
import Container from '../common/Container';
import { WindowWidthContext } from '../hooks/useWindowWidth';

const PostListContainer = styled.div(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const LoadMoreButton = styled.button(() => ({
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 16,
  marginTop: 20,
  transition: 'background-color 0.3s ease',
  fontWeight: 600,

  '&:hover': {
    backgroundColor: '#0056b3',
  },
  '&:disabled': {
    display: 'none',
  },
}));

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [start, setStart] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const { isSmallerDevice } = useContext(WindowWidthContext);
  const limit = isSmallerDevice ? 5 : 10;

  const fetchPosts = async (start, limit) => {
    try {
      const { data: newPosts } = await axios.get('/api/v1/posts', {
        params: { start, limit },
       
      });
      console.log(start);
      console.log(limit);
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setStart(start + newPosts.length); 
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts(start, limit);
  }, [isSmallerDevice]);

  useEffect(() => {
    const getTotalPosts = async () => {
      try {
        const response = await axios.get('/api/v1/posts');
        console.log(response);
        setTotalPosts(response.data.length);
      } catch (error) {
        console.error('Failed to fetch total posts:', error);
      }
    };
    getTotalPosts();
  }, []);

  const handleClick = () => {
    setIsLoading(true);
 
    console.log(posts.length);
    const remainingPosts = totalPosts - posts.length;
    // console.log(remainingPosts);
    const postsToFetch = Math.min(limit, remainingPosts);
    fetchPosts(start+10, postsToFetch).finally(() => {
      setIsLoading(false);
    });
  };

 
  const totalImagesLoaded = posts.length / 3;
  const totalImages = Math.ceil(totalPosts / 3); 
  const allImagesLoaded = totalImagesLoaded >= totalImages;

  return (
    <Container>
      <PostListContainer>
        {posts.map(post => (
          
          <Post key={post.id} post={post} />
         
          
        ))}
      </PostListContainer>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        { ( // Show the "Load More" button only if there are more images to load
          <LoadMoreButton onClick={handleClick} disabled={isLoading}>
            {!isLoading ? 'Load More' : 'Loading...'}
          </LoadMoreButton>
        )}
      </div>
    </Container>
  );
}
