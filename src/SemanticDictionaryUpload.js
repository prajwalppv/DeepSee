import React, { Component } from 'react';
import UploadButton from './Button';
import './Saliency.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui';
import SemanticDictionary from './SemanticDictionary';

class SemDictUpload extends Component {
state = {loading:false, image:false,
            widthC:3, heightC:3, hasResult:false,
            originalImage:null, resultGrad:null, resultSmooth:null}


  onImageChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('image', file)

    fetch(`http://127.0.0.1:5000/uploadImage`, {
          method: ['POST'],
          body: data
      }).then(this.setState({image:true}))
  }

  onGenerateChange = e => {
    this.setState({hasResult:false, loading:true, activations:null})
    fetch(`http://127.0.0.1:5000/semanticDictionary`, {
          method: ['POST'],
          timeout: 2000
      }).then(res =>{
              return res.json()
              })
        .then(response => {
        this.setState({hasResult:true, loading:false ,activations:response['activations']});
        console.log(this.state)
        })
        .catch(e => console.error(e))

  }
render(){
    const {loading, hasResult, image} = this.state
    const content = () => {
    return <div>

              <div style={{display: "inline-block", padding:20}}>
                <UploadButton onChange={this.onImageChange} name='Image'/>
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
                {hasResult && <div style={{padding:10}}>
                                <SemanticDictionary n={this.state.activations}/>
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

export default SemDictUpload;
