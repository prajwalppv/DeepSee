import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import Iframe from 'react-iframe'
import * as values from "./dns"

const dns =  values.AWSDNS + ":3000/spatial_attr.html";
console.log(dns)

class SpatialAttribution extends Component{
shouldComponentUpdate() {
 return false;
}
render(){
    return(
    <Iframe url={dns}
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
