import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import Iframe from 'react-iframe'



class NeuronGroups extends Component{
render(){
    return(
    <Iframe url="http://www.youtube.com/embed/xDMP3i36naA"
            width="450px"
            height="450px"
            id="myId"
            className="myClassname"
            display="initial"
            position="relative"/>
            );
    }
}
export default NeuronGroups;
