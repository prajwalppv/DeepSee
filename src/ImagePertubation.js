import React, { Component } from 'react';
import UploadButton from './Button';
import './ImagePertubation.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
// import {CanvasJS.CanvasJSChart} from 'canvasjs'
import CanvasJSReact from './canvasjs.react'

// var CanvasJSReact = require('./canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const default_classes = 'Atelectasis,Cardiomegaly,Effusion,Infiltration,Mass,Nodule,Pneumonia,Pneumothorax,Consolidation,Edema,Emphysema,Fibrosis,Pleural_Thickening,Hernia'

class ImagePertubation extends Component {
  
  state = {loading:false, image:false, class_names:default_classes, 
            widthC:3, heightC:3, model:false,
            hasResult:false, result:null, region_probs:null, curArea:0}
  

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

  updateClassNames = e => {
    this.setState({class_names:e.target.value})
  }

  getChartOptions = e => {
    const {curArea, region_probs} = this.state

    const classes = this.state.class_names.split(',')
    if (curArea == -1) {
      curArea = region_probs.length-1
    }
    
    const data = []
    // region_probs[curArea][x]
    classes.map(x => data.push({y:10, 
                                label:x}))
    console.log('here')
    const Chartoptions = {
			animationEnabled: true,
			theme: "light2",
			title:{
				text: "Disease Probabilities"
			},
			axisX: {
        title: "Disease",
        reversed: true,
        labelFontSize: 10,
        interval:1,
			},
			axisY: {
				labelFormatter: this.addSymbols
			},
			data: [{
				type: "bar",
				dataPoints: data
			}]
    }
    return Chartoptions
  }


  onGenerateChange = e => {
    this.setState({hasResult:false, loading:true})
    fetch(`http://127.0.0.1:5000/perturb`, {
          method: ['POST'],
          headers: {widthC: this.state.widthC,
                    heightC: this.state.heightC,
                    class_names: this.state.class_names,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'},
      }).then(res =>{
              return res.json()
              })
        .then(response => {
          this.setState({loading:false, 
                          hasResult:true, 
                          result:response['imagestr'], 
                          region_probs:response['region_probs'],
                          curArea:response['origIndex']})
        })
        .catch(e => console.error(e))
  }
  
  
  render() {
    const {loading, hasResult, image, model} = this.state
    const content = () => {
    return <div>
              <div style={{display: "inline-block", padding:20, marginBottom:0}}>
                <UploadButton onChange={this.onModelChange} name='Model'/>
                <div>
                    <div style={{fontSize:"50%"}}>Number of Splits On Width</div>
                    <TextInputField placeholder='3'
                                    onChange={this.updateWidthChunks}/>
                </div>
              </div>
              <div style={{display: "inline-block", padding:20, marginBottom:0}}>
                <UploadButton onChange={this.onImageChange} name='Image'/>
                <div>
                  <div style={{fontSize:'50%'}}>Number of Splits On Height</div>
                  <TextInputField placeholder='3'
                                  onChange={this.updateHeightChunks} style={{label_color:'red'}}/>
                </div>
              </div>
              <div style={{width:'60%', margin:'auto'}}>
                  <div style={{fontSize:'50%'}}>Class Names (Comma separated, no spaces)</div>
                  <TextInputField placeholder='Atelectasis,Cardiomegaly,Effusion,Infiltration,Mass,Nodule,Pneumonia,Pneumothorax,Consolidation,Edema,Emphysema,Fibrosis,Pleural_Thickening,Hernia'
                                  onChange={this.updateClassNames} style={{label_color:'red'}}/>
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
                            <img style={{display:"inline-block"}} src={"data:image/png;base64," + this.state.result}/>
                            {/* <CanvasJSChart style={{display:"inline-block"}} options={Chartoptions}/> */}
                          </div>}
                <CanvasJSChart options={this.getChartOptions()}/>
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
