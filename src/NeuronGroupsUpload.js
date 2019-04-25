import React, { Component } from 'react';
import UploadButton from './Button';
import './Saliency.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField, Select, Heading, toaster } from 'evergreen-ui';
import NeuronGroups from './NeuronGroups';
import * as values from "./dns"

const uploadImageUrl = values.AWSDNS + ":8000/uploadImage";
const uploadModelUrl = values.AWSDNS + ":8000/uploadModel"
const neuronGroupsUrl = values.AWSDNS + ":8000/neuronGroups"

class NeuronGroupsUpload extends Component {
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
      }).then(res => {
        return res.json()
      }).then(resp => {
        this.setState({model:true})}
        )
  }

  onGenerateChange = e => {
    this.setState({hasResult:false, loading:true, activations:null})
    const data = new FormData()
    if (this.state.layer == null){
        toaster.danger("Choose a valid layer to visualize")
        }
    if (this.state.group == null){
        toaster.danger("Choose a valid group to visualize")
        }
    console.log(this.state.layer)
    data.append('layer', this.state.layer)
    data.append('group', this.state.group)

    fetch(neuronGroupsUrl, {
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
    console.log([e.target.value])
    this.setState({[e.target.name] :e.target.value})
  }


render(){
    const {loading, hasResult, image, model, layer, group} = this.state
    const content = () => {
    return <div>

              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onImageChange} name='Image'/>
              </div>

              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onModelChange} name='Model'/>
              </div>

              <div style={{display: "inline-block", padding:20}}>
                <Heading size={600} color='white'> Choose a layer </Heading>
                <Select name="layer" width={240} onChange={event=> this.onSelectChange(event)}>
                  <option value="">Choose a layer...</option>
                  <option value="conv2_block1_concat/concat">Conv2 Block1</option>
                  <option value="conv3_block1_concat/concat">Conv3 Block1</option>
                  <option value="conv4_block1_concat/concat">Conv4 Block1</option>
                  <option value="conv5_block1_concat/concat">Conv5 Block1</option>
                </Select>
              </div>

              <div style={{display: "inline-block", padding:20}}>
                <Heading size={600} color='white'> Choose number of groups </Heading>
                <Select name="group" width={240} onChange={event=> this.onSelectChange(event)}>
                  <option value="">Choose a number...</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </Select>
              </div>

              <div style={{padding:10}}>
                  <Button className='button' onClick={this.onGenerateChange} disabled={!image || !model || !layer || !group}background='green'
                      appearance="primary" iconAfter="arrow-right">{hasResult?"Try Again":"Get Neuron Groups"}</Button>
              </div>

              <div style={{padding:10}}>
                <LoadingOverlay active={loading} spinner text='Loading Visualization' styles={{
                                                overlay: (base) => ({
                                                  ...base,
                                                  background: 'rgba(100, 100, 100, 1)'
                                                })
                                              }}/>
                {hasResult && <div style={{padding:10}}>
                                <NeuronGroups/>
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

export default NeuronGroupsUpload;
