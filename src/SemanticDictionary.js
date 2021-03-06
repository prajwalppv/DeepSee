import React, { Component } from 'react';
import UploadButton from './Button';
import './SemanticDictionary.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import ImageMapper from 'react-image-mapper';
import bg from "./img/activation.jpeg"



class SemanticDictionary extends Component{

    state = {hoveredArea:null, activations:this.props.n, layer:this.props.layer, image:this.props.image};
    n = 14
    size = 500
    MAP = {
      name: "my-map",
      areas: this.generateAreas(this.n,this.size)
    }

    getCoordinates(row,col,n,size) {
      let coords = []
      let offset = Math.trunc(size/n)
      coords.push(row*offset,col*offset)
      coords.push((row+1)*offset, col*offset)
      coords.push((row+1)*offset, (col+1)*offset)
      coords.push(row*offset,(col+1)*offset)

      return coords
    }

    generateAreas(n,size) {
      let areas = []
      let index = 0
      for(let row=0;row<this.n;row++){
        for(let col=0;col<this.n;col++){
          let obj = {};
          obj.n = index.toString();
          obj.shape = 'poly';
          obj.coords = this.getCoordinates(col,row,n,size)
          index++;
          areas.push(obj)
        }
      }
      return areas
    }

    enterArea(area) {
        this.setState({ hoveredArea: area });
    }

    leaveArea(area) {
        this.setState({ subImages: null });
    }

    getTipPosition(area) {
        let subImg = [];
        this.setState({ hoveredArea: area });

        let row = Math.floor(area.n/14)
        let col = area.n%14
        let ns = this.state.activations[row][col]
        console.log(ns)
        let src = 'img/activation.jpeg'
        let sprite_n_wrap = 14;
        let sprite_size= 88;

        for (let i=0;i<4;i++){
            let a = -sprite_size*(ns[i]['n']%sprite_n_wrap)
            let b = -sprite_size*Math.floor(ns[i]['n']/sprite_n_wrap)
            subImg.push(<div key={i} style={{backgroundImage: 'url('+ bg+')',width:'88px',height:'88px',float:'left',margin:'15px',backgroundPosition:`${a}px ${b}px`}}></div>)
        }
        this.setState({subImages:subImg})


    }

render(){
    return(
    <div className="container">
    {console.log(this.state)}
        <ImageMapper src={"data:image/png;base64," + this.state.image} map={this.MAP} width={500} height={500}
                  onMouseEnter = {area =>this.getTipPosition(area)}
                  onMouseLeave = {area => this.leaveArea(area)}
                  onClick={area => this.getTipPosition(area)}
      	/>

        {this.state.subImages!==null? <div className="dict" > {this.state.subImages}</div>  : <div>Hover over an area on the image to see activations</div>}

    </div>

    );
}

}


export default SemanticDictionary;
