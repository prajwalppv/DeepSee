import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import Iframe from 'react-iframe'



class NeuronGroups extends Component{
render(){
    return(
    <Iframe url="https://nervous-yonath-588b40.netlify.com/"
            width="1200px"
            height="1450px"
            id="myId"
            className="myClassname"
            display="initial"
            position="relative"/>
            );

//    <Iframe url="http://localhost:3000/neuron_group.html"
//            width="500px"
//            height="350px"
//            id="myId"
//            className="myClassname"
//            display="initial"
//            position="relative"/>
//            );
    }
}
export default NeuronGroups;
