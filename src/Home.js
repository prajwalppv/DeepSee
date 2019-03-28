import React, { Component } from 'react';
// import { CenteredHeader,AppDiv, ContainerDiv } from './App.js'
// import Background from './img/logo.png';
import { Link } from 'react-router-dom'
// import { ResponsiveImage, ResponsiveImageSize } from 'react-responsive-image';
import styled from 'styled-components';
// import { AppRegistry, View } from 'react-native';

const Logo = styled.img`
  width: 24em;
  height: 24em;
  border-radius: 50%;
`;

const Img = styled.img`
  width: 70%;
  height: 70%;
`;

const PeopleImage = styled.img`
  width: 10em;
  height: 10em;
`;

const HeaderDiv = styled.div`
  background-color: #282c34;
  padding-top: 5vh;
  text-align: center;
  font-family: 'Zilla Slab Highlight', sans-serif;
  color: black;
`;


const StyledBody = styled.body`
`

const StyledDiv = styled.div`
  text-align: center;
  font-family: 'Zilla Slab Highlight', sans-serif;
  color: black

`
const StyledH4 = styled.h4`
size: 10;
color: #288c88
`

const ProfileTitle = styled.h1`
  color: #288c88;
`

const PeopleTitle = styled.h2`
  color: green;
`

class Home extends Component {
  render() {
    return (
        <StyledBody>
        <HeaderDiv>
        <Link to="/">
          <Logo src={require('./img/logo.png')} alt='Logo'/>
        </Link>
        <ProfileTitle> See what your Neural Network sees!</ProfileTitle>
        <ProfileTitle>&nbsp; </ProfileTitle>
      </HeaderDiv>

        <StyledDiv>
        <Img src={require('./img/wordcloud.png')} alt='WordCloud'/>

      </StyledDiv>

    </StyledBody>



    );
  }
}



export default Home;

