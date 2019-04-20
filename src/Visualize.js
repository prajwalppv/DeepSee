import React, { Component } from 'react';
// import ReactDOM from 'react-dom'
import { Button, Pane, Tab, TabNavigation, Paragraph, Tablist, SidebarTab ,Text, Strong} from 'evergreen-ui'
// import {Link}  from 'react-router-dom';
// import NavBar from "./navBar";
import ImagePertubation from "./ImagePertubation"
import GuidedBackProp from "./GuidedBackProp"
import Saliency from "./Saliency"
import App from "./App";
import SemanticDictionary from "./SemanticDictionaryUpload";
import NeuronGroups from "./NeuronGroups";

// import {BrowserRouter as Router,Route}  from 'react-router-dom';

class Visualize extends Component{
    state={
        selectedIndex:0,
        tabs: ['Image Perturbation','Saliency Maps','Guided BackProp','Channel Activations','Semantic dictionaries',"Neuron Groups"],
        components: [<ImagePertubation/>,<Saliency/>,<GuidedBackProp/>,<App/>,<SemanticDictionary/>,<NeuronGroups/>],
        icons:['home','series-configuration','cloud-upload','help']
    }

    render(){
        return (
           <div>
               <Pane display="flex" height={240}>
                    <Tablist marginBottom={16} flexBasis={240} marginRight={10}>
                        <Pane borderTop borderRight borderLeft borderBottom 
                        borer='muted'
                        background='tint1'
                        elevation={1}
                        height={31}
                        >
                            <Strong marginLeft={5} size={600}>Visualizations</Strong>
                        </Pane>
                        {this.state.tabs.map((tab, index) => (
                        <SidebarTab
                            key={tab}
                            id={tab}
                            onSelect ={() => this.setState({ selectedIndex: index })}
                            isSelected={index === this.state.selectedIndex}
                            aria-controls={`panel-${tab}`}
                            size={100}
                        >
                            {tab}
                        </SidebarTab>
                        ))}
                    </Tablist>
                    <Pane background="tint1" flex="1">
                        {this.state.tabs.map((tab, index) => (
                        <Pane
                            key={tab}
                            id={`panel-${tab}`}
                            role="tabpanel"
                            aria-labelledby={tab}
                            aria-hidden={index !== this.state.selectedIndex}
                            display={index === this.state.selectedIndex ? 'block' : 'none'}
                        > 
                            {this.state.components[index]}
                        </Pane>
                            ))}
                    </Pane>
                </Pane>
           </div>
        );
    }
}

export default Visualize;