import React, { Component } from 'react';
import UploadButton from './Button';
import './Saliency.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField, Select, Heading, toaster } from 'evergreen-ui';
import SpatialAttribution from './SpatialAttribution';
import * as values from "./dns"

const uploadImageUrl = values.AWSDNS + ":8000/uploadImage";
const uploadModelUrl = values.AWSDNS + ":8000/uploadModel"
const spatialAttributionUrl = values.AWSDNS + ":8000/spatialAttribution"

class SpatialAttributionUpload extends Component {
state = {loading:false, image:false,
            widthC:3, heightC:3, hasResult:false,
            originalImage:null, resultGrad:null, resultSmooth:null, layer:null}


  onImageChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('image', file)

    fetch(uploadImageUrl, {
          method: ['POST'],
          body: data
      }).then(this.setState({image:true}))
  }

  onModelChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('model', file)

    fetch(uploadModelUrl, {
          method: ['POST'],
          body: data
      }).then(this.setState({model:true}))
  }

  onGenerateChange = e => {
    this.setState({hasResult:false, loading:true, activations:null})
    const data = new FormData()
    if (this.state.layer1 == null){
        toaster.danger("Choose a valid layer1 to visualize")
        }
    if (this.state.layer2 == null){
        toaster.danger("Choose a valid layer2 to visualize")
        }
    console.log(this.state.layer1)
    console.log(this.state.layer2)
    data.append('layer1', this.state.layer1)
    data.append('layer2', this.state.layer2)

    fetch(spatialAttributionUrl, {
          method: ['POST'],
          timeout: 2000,
          body:data
      }).then(res =>{
              return res.json()
              })
        .then(response => {
        this.setState({hasResult:true, loading:false });
        console.log(this.state)
        })
        .catch(e => console.error(e))

  }

  onSelectChange = e =>{
    this.setState({[e.target.name] :e.target.value})
  }


render(){
    const {loading, hasResult, image, model, layer1, layer2} = this.state
    const content = () => {
    return <div>
              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onImageChange} name='Image'/>
              </div>
              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onModelChange} name='Model'/>
              </div>
              <div style={{display: "inline-block", padding:20}}>
                <Heading size={700} color='white' padding={20}> Choose layer1 </Heading>
                <Select name="layer1" width={240} onChange={event=> this.onSelectChange(event)}>
                  <option value="">Choose a layer...</option>
                  <option value="conv2_block1_concat/concat">Conv2 Block1</option>
                  <option value="conv3_block1_concat/concat">Conv3 Block1</option>
                  <option value="conv4_block1_concat/concat">Conv4 Block1</option>
                  <option value="conv5_block1_concat/concat">Conv5 Block1</option>
                </Select>
              </div>

              <div style={{display: "inline-block", padding:20}}>
                <Heading size={700} color='white' padding={20}> Choose layer2 </Heading>
                <Select name="layer2" width={240} onChange={event=> this.onSelectChange(event)}>
                  <option value="">Choose a layer...</option>
                  <option value="conv2_block1_concat/concat">Conv2 Block1</option>
                  <option value="conv3_block1_concat/concat">Conv3 Block1</option>
                  <option value="conv4_block1_concat/concat">Conv4 Block1</option>
                  <option value="conv5_block1_concat/concat">Conv5 Block1</option>
                </Select>
              </div>

              <div style={{padding:10}}>
                  <Button className='button' onClick={this.onGenerateChange} disabled={!image || !model || !layer1 || !layer2}background='green'
                      appearance="primary" iconAfter="arrow-right">{hasResult?"Try Again":"Get Spatial Attribution"}</Button>
              </div>

              <div style={{padding:10}}>
                <LoadingOverlay active={loading} spinner text='Loading Visualization' styles={{
                                                overlay: (base) => ({
                                                  ...base,
                                                  background: 'rgba(100, 100, 100, 1)'
                                                })
                                              }}/>
                {hasResult && <div style={{padding:10}}>
                                <SpatialAttribution/>
                              </div>}
              </div>
            </div>
    }

    return (
      <div className="App">
        <header className="App-header">
          {content()}

        </header>
      </div>
    );
    }
}

export default SpatialAttributionUpload;
