import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import Iframe from 'react-iframe'



class SpatialAttribution extends Component{
shouldComponentUpdate() {
 return false;
}
render(){
    return(
    <Iframe url="http://localhost:3000/spatial_attr.html"
            width="470px"
            height="270px"
            id="myId"
            className="myClassname"
            display="initial"
            position="relative"/>
            );
    }
}
export default SpatialAttribution;
