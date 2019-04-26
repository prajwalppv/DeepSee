import React, { Component } from 'react';
import UploadButton from './Button';
import './Saliency.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField, Select, Heading, toaster } from 'evergreen-ui';
import SemanticDictionary from './SemanticDictionary';
import * as values from "./dns"

const uploadImageUrl = values.AWSDNS + ":8000/uploadImage"
const uploadModelUrl = values.AWSDNS + ":8000/uploadModel"
const semanticDictionaryUrl = values.AWSDNS + ":8000/semanticDictionary"

class SemDictUpload extends Component {
state = {loading:false, image:false, hasResult:false,
            originalImage:null, resultGrad:null, resultSmooth:null, layer:null}


  onImageChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('image', file)

    fetch(uploadImageUrl, {
          method: ['POST'],
          body: data
      }).then(res => {
        return res.json()
      }).then(res => {
        this.setState({image:true})}
        )
  }

  onGenerateChange = e => {

    if (this.state.layer == null || this.state.layer==='def'){
        toaster.danger("Choose a valid layer to visualize");
        return
        }

    this.setState({hasResult:false, loading:true, activations:null})
    const data = new FormData()
    data.append('layer', this.state.layer)

    fetch(semanticDictionaryUrl, {
          method: ['POST'],
          timeout: 2000,
          body:data
      }).then(res =>{
              return res.json()
              })
        .then(response => {
        this.setState({hasResult:true, loading:false, activations:response['activations']});
        })
        .catch(e => console.error(e))

  }

  onSelectChange = e =>{
    this.setState({layer:e.target.value})
  }

render(){
    const {loading, hasResult, image, layer} = this.state
    const content = () => {
    return <div>

              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onImageChange} name='Image'/>
              </div>
              <div style={{display: "inline-block", padding:20}}>
                <Heading size={700} color='white' padding={20}> Choose a layer to visualize </Heading>
                <Select  width={240} onChange={event=> this.onSelectChange(event)}>
                  <option value="">Choose a layer...</option>
                  <option value="conv4_block1_concat/concat">Conv2 Block1</option>
                  <option value="conv4_block1_concat/concat">Conv3 Block1</option>
                  <option value="conv4_block1_concat/concat">Conv4 Block1</option>
                  <option value="conv4_block1_concat/concat">Conv5 Block1</option>
                </Select>
              </div>
              <div style={{padding:10}}>
                  <Button className='button' onClick={this.onGenerateChange} disabled={!image}background='green'
                      appearance="primary" iconAfter="arrow-right">{hasResult?"Try Again":"Get Semantic Dictionary"}</Button>
              </div>

              <div style={{padding:10}}>
                <LoadingOverlay active={loading} spinner text='Loading Visualization' styles={{
                                                overlay: (base) => ({
                                                  ...base,
                                                  background: 'rgba(100, 100, 100, 1)'
                                                })
                                              }}/>
                {/* {hasResult && <div style={{padding:10}}>
                                <SemanticDictionary n={this.state.activations} layer={this.state.layer}/>
                              </div>} */}
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

export default SemDictUpload;