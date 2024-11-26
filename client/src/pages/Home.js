// Path: client/src/pages/Home.js

import React from 'react';
import '../styles/pages/Home.css';
import PropertyList from '../components/properties/PropertyList';


const Home = () => {
  return (
    <div className="home-page">
      <PropertyList />
    </div>
  );
};

export default Home;