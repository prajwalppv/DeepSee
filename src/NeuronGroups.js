import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import Iframe from 'react-iframe'
import * as values from "./dns"

const dns = values.AWSDNS + ":3000/neuron_group.html";
console.log(dns)

class NeuronGroups extends Component{

shouldComponentUpdate() {
 return false;
}
render(){
    return(

    <Iframe url={dns}
            width="500px"
            height="350px"
            id="myId"
            className="myClassname"
            display="initial"
            position="relative"/>
            );
    }
}
export default NeuronGroups;
