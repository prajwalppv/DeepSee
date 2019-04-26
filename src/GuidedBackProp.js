import React, { Component } from 'react';
import UploadButton from './Button';
import './GuidedBackProp.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import * as values from "./dns"

const uploadImageUrl = values.AWSDNS + ":5000/uploadImage"
const uploadModelUrl = values.AWSDNS + ":5000/uploadModel"
const guidedBPUrl = values.AWSDNS + ":5000/guidedBP"

class GuidedBackProp extends Component {
  state = {loading:false, uploading:false, image:false, model:false,
        hasResult:false, originalImage:null, resultImg:null}
  

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
    this.setState({uploading:true})
    const file = e[0]

    const data = new FormData()
    data.append('model', file)

    fetch(uploadModelUrl, {
          method: ['POST'],
          body: data
      }).then(res => {
        return res.json()
      }).then(resp => {
          this.setState({model:true, uploading:false})}
        )

  }

  onGenerateChange = e => {
    this.setState({hasResult:false, loading:true})
    fetch(guidedBPUrl, {
          method: ['POST'],
          timeout: 2000
      }).then(res =>{
              return res.json()
              })
        .then(image => {
          this.setState({loading:false, hasResult:true, 
            resultImg:image['imagestrResult'],
            originalImage:image['originalImage']})
        })
        .catch(e => console.error(e))

  }
  
  render() {
    const {loading, uploading, hasResult, image, model} = this.state
    const content = () => {
    return <div>
              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onModelChange} name='Model'/>
              </div>
              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onImageChange} name='Image'/>
              </div>
              <div style={{padding:10}}>
                  <Button className='button' onClick={this.onGenerateChange} disabled={!image || !model}background='green' 
                      appearance="primary" iconAfter="arrow-right">{hasResult?"Try Again":"Get Guided BackProp Images"}</Button>
              </div>

              <div style={{padding:10}}>
                <LoadingOverlay active={uploading} spinner text='Uploading Model' styles={{
                                                overlay: (base) => ({
                                                  ...base,
                                                  background: 'rgba(100, 100, 100, 1)'
                                                })
                                              }}/>
                <LoadingOverlay active={loading} spinner text='Loading Visualization' styles={{
                                                overlay: (base) => ({
                                                  ...base,
                                                  background: 'rgba(100, 100, 100, 1)'
                                                })
                                              }}/>
                {hasResult && <div style={{padding:0, padding:10}}>
                                <div style={{display: "inline-block", marginRight:10}}>
                                  <div style={{fontSize:"50%"}}>Original Image</div>
                                  <img src={"data:image/png;base64," + this.state.originalImage}/>         
                                </div>
                                <div style={{display: "inline-block", marginLeft:10}}>
                                  <div style={{fontSize:"50%"}}>Guided Back Prop</div>
                                  <img src={"data:image/png;base64," + this.state.resultImg}/>         
                                </div>
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

export default GuidedBackProp;
