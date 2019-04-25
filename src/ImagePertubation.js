import React, { Component } from 'react';
import UploadButton from './Button';
import './ImagePertubation.css';
import LoadingOverlay from 'react-loading-overlay';
import ImageMapper from 'react-image-mapper';
import { Button, TextInputField } from 'evergreen-ui'
import CanvasJSReact from './canvasjs.react'
import * as values from "./dns"

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const default_classes = 'Atelectasis,Cardiomegaly,Effusion,Infiltration,Mass,Nodule,Pneumonia,Pneumothorax,Consolidation,Edema,Emphysema,Fibrosis,Pleural_Thickening,Hernia'

const uploadImageUrl = values.AWSDNS + ":5000/uploadImage"
const uploadModelUrl = values.AWSDNS + ":5000/uploadModel"
const perturbUrl = values.AWSDNS + ":5000/perturb"



class ImagePertubation extends Component {
  
  state = {loading:false, image:false, class_names:default_classes, 
            widthC:3, heightC:3, model:false,
            hasResult:false, result:null, region_probs:null, 
            toggleArea:true, curArea:-1}
  

  generateAreas() {
    const {widthC, heightC} = this.state
    let areas = []
    let index = 0
    for(let row=0;row<widthC;row++){
      for(let col=0;col<heightC;col++){
        let obj = {};
        obj.n = index.toString();
        obj.shape = 'poly';
        obj.coords = this.getCoordinates(col,row,widthC,heightC)
        index++;
        areas.push(obj)
      }
    }
    return {name: 'map',
            areas: areas}
  }

  getCoordinates(row,col, numC, numR) {
    let coords = []
    let colOffset = Math.trunc(224/numC)
    let rowOffset = Math.trunc(224/numR)
    coords.push(row*rowOffset,col*colOffset)
    coords.push((row+1)*rowOffset, col*colOffset)
    coords.push((row+1)*rowOffset, (col+1)*colOffset)
    coords.push(row*rowOffset,(col+1)*colOffset)

    return coords
  }

  onImageChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('image', file)

    fetch(uploadImageUrl, {
          method: ['POST'],
          body: data
      }).then(this.setState({model:true}))
  }

  onModelChange = e => {
    const file = e[0]

    const data = new FormData()
    data.append('model', file)

    fetch(uploadModelUrl, {
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
    
    const data = []
    classes.map(x => data.push({y:region_probs[curArea][x]*100, 
                                label:x}))

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
        labelAngle:135,
        interval:1,
			},
			axisY: {
        title: 'Probability',
        maximum: 100,
        minimum: 0
        
			},
			data: [{
				type: "column",
				dataPoints: data
			}]
    }
    return Chartoptions
  }

  onGenerateChange = e => {
    this.setState({hasResult:false, loading:true})
    fetch(perturbUrl, {
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

  enterArea = area => {
    const {toggleArea} = this.state
    if (toggleArea) {
      this.setState({curArea:area.n})
    }
  }

  leaveArea = area => {
    const {toggleArea} = this.state
    if (toggleArea) {
      this.setState({curArea:this.state.region_probs.length-1})
    }
  }

  clickArea = area => {
    const {curArea, toggleArea} = this.state
    if (toggleArea == false && curArea == area.n) {
      this.setState({toggleArea:true})
    } else {
      this.setState({toggleArea:false, curArea:area.n})
    }
  }

  
  
  render() {
    const {loading, hasResult, image, model} = this.state
    const content = () => {
    return <div className='wrapper'>
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
                  {<Button className='button' onClick={this.onGenerateChange} disabled={!image || !model} background='green'
                      appearance="primary" iconAfter="arrow-right">{hasResult?"Try Again":"Find Areas of Interest"}</Button>}
              </div>

              <div style={{marginTop:50}}>
                <LoadingOverlay active={loading} spinner text='Loading Visualization' styles={{
                                                overlay: (base) => ({
                                                  ...base,
                                                  background: 'rgba(100, 100, 100, 1)'
                                                })
                                              }}/>
                {hasResult && <div>
                                <div style={{display: "inline-block", float:'left'}}>
                                  <ImageMapper src={"data:image/png;base64," + this.state.result} map={this.generateAreas()}
                                            onMouseEnter = {area => this.enterArea(area)}
                                            onMouseLeave = {area => this.leaveArea()}
                                            onClick= {area => this.clickArea(area)}
                                  />
                                </div>
                                <div style={{display: "inline-block", width:'66%'}}>
                                  <CanvasJSChart options={this.getChartOptions()}/>
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

export default ImagePertubation;
