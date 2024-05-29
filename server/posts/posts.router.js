const express = require('express');
const axios = require('axios');
const { fetchPosts } = require('./posts.service');

const router = express.Router();

router.get('/', async (req, res) => {
  const start = parseInt(req.query.start, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const posts = await fetchPosts(start, limit);
    const imagePlaceholders = [
      // { url: 'https://via.placeholder.com/600/92c952' },
      // { url: 'https://via.placeholder.com/600/771796' },
      // { url: 'https://via.placeholder.com/600/24f355' },
      // { url: 'https://via.placeholder.com/600/d32776' },
      // { url: 'https://via.placeholder.com/600/f66b97' },
      // Add more placeholder URLs if necessary
    ];

    // Fetch photos for each post asynchronously
    const postsWithImages = await Promise.all(posts.map(async (post, index) => {
      try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/albums/${post.id}/photos`);
        const images = response.data.map(photo => ({ url: photo.url }));

        // Use images from response or fallback to placeholders if not enough images
        return {
          ...post,
          images: images.slice(0, 3).concat( images.length>0 && images.length < 3 ? imagePlaceholders.slice(0, 3 - images.length) : []),
        };
      } catch (error) {
        console.error(`Failed to fetch images for post ${post.id}:`, error);
        return {
          ...post,
          images: imagePlaceholders.slice(0, 3), // Fallback to placeholders
        };
      }
    }));

    res.json(postsWithImages);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

module.exports = router;