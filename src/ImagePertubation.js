import React, { Component } from 'react';
import UploadButton from './Button';
import './ImagePertubation.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'

class ImagePertubation extends Component {
  state = {loading:false, image:false, model:false,
            widthC:3, heightC:3, hasResult:false,  result:null}
  

  onImageChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('image', file)

    fetch(`http://127.0.0.1:5000/uploadImage`, {
          method: ['POST'],
          body: data
      }).then(this.setState({model:true}))
  }

  onModelChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('model', file)

    fetch(`http://127.0.0.1:5000/uploadModel`, {
          method: ['POST'],
          body: data
      }).then(this.setState({image:true}))

  }

  updateWidthChunks = e => {
    this.setState({widthC:e.target.value})
  }

  updateHeightChunks = e => {
    this.setState({heightC:e.target.value})
  }

  onGenerateChange = e => {
    this.setState({hasResult:false, loading:true})
    fetch(`http://127.0.0.1:5000/perturb`, {
          method: ['POST'],
          headers: {widthC: this.state.widthC,
                    heightC: this.state.heightC,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'},
      }).then(res =>{
              return res.json()
              })
        .then(image => {
          this.setState({loading:false, hasResult:true, result:image['imagestr']})
        })
        .catch(e => console.error(e))
  }
  
  
  render() {
    const {loading, hasResult, image, model} = this.state
    const content = () => {
    return <div>
              <div style={{display: "inline-block", padding:20, marginBottom:20}}>
                <UploadButton onChange={this.onModelChange} name='Model'/>
                <div>
                    <div style={{fontSize:"50%"}}>Number of Splits On Width</div>
                    <TextInputField placeholder='3'
                                    onChange={this.updateWidthChunks}/>
                </div>
              </div>
              <div style={{display: "inline-block", padding:20, marginBottom:20}}>
                <UploadButton onChange={this.onImageChange} name='Image'/>
                <div>
                  <div style={{fontSize:'50%'}}>Number of Splits On Height</div>
                  <TextInputField placeholder='3'
                                  onChange={this.updateHeightChunks} style={{label_color:'red'}}/>
                </div>
                </div>
              <div>
                  <Button className='button' onClick={this.onGenerateChange} disabled={!image || !model}background='green' 
                      appearance="primary" iconAfter="arrow-right">{hasResult?"Try Again":"Find Areas of Interest"}</Button>
              </div>

              <div style={{padding:50}}>
                <LoadingOverlay active={loading} spinner text='Loading Visualization' styles={{
                                                overlay: (base) => ({
                                                  ...base,
                                                  background: 'rgba(100, 100, 100, 1)'
                                                })
                                              }}/>
                {hasResult && <div styles={{"padding-top":50}}>
                            <img src={"data:image/png;base64," + this.state.result}/>
                            {/* <img src="server/result.jpg"/> */}
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

export default ImagePertubation;
