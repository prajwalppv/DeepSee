import React, { Component } from 'react';
import UploadButton from './Button';
import './SemanticDictionary.css';
import LoadingOverlay from 'react-loading-overlay';
import { Button, TextInputField } from 'evergreen-ui'
import ImageMapper from 'react-image-mapper';
import SvelteComponent from 'react-svelte';
import ReactHtmlParser, {processNodes, convertNodeToElement, htmlparser2} from 'react-html-parser'


class SemacticDictonary extends Component{

    state = {hoveredArea:null}
    n = 14
    size = 500
    URL = "./img/wordcloud.png"
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

    // The crop function
    crop(canvas, offsetX, offsetY, width, height, callback) {
      // create an in-memory canvas
      var buffer = document.createElement('canvas');
      var b_ctx = buffer.getContext('2d');
      // set its width/height to the required ones
      buffer.width = width;
      buffer.height = height;
      // draw the main canvas on our buffer one
      // drawImage(source, source_X, source_Y, source_Width, source_Height,
      //  dest_X, dest_Y, dest_Width, dest_Height)
      b_ctx.drawImage(canvas, offsetX, offsetY, width, height,
                      0, 0, buffer.width, buffer.height);
      // now call the callback with the dataURL of our buffer canvas
      console.log(buffer)
//      callback(buffer.toDataURL());
    };


    // #main canvas Part
    getSubImage1(area){
    let canvas = document.getElementById('canvas');
    this.img = new Image();
    this.img.crossOrigin = "Anonymous";
    console.log(this.img)


    this.img.onload = ()=>{
        console.log("onload")
      canvas.width = 500;
      canvas.height = 500;
      canvas.getContext('2d').drawImage(this, 0, 0);
      // set a little timeout before calling our cropping thing
      setTimeout(function() {
        this.crop(canvas, 100, 70, 70, 70, this.callback)
      }, 1000);
    };

    this.img.src = "img/activation.jpeg";
    console.log("done")
    }

// what to do with the dataURL of our cropped image
    callback() {
    }

    getSubImage(area){
        console.log(area)
        const data = new FormData()
        data.append('image', "../img/activation.jpeg")
        data.append('n', area.n)
        data.append('sprite_n_wrap', 14)


        fetch(`http://127.0.0.1:5000/getSubImage`, {
              method: ['POST'],
              body: data
          }).then((response) =>{
              console.log(response.json())
              })
    }

    enterArea(area) {
        this.setState({ hoveredArea: area });
    }

    leaveArea(area) {
        this.setState({ hoveredArea: null });
    }

    getTipPosition(area) {
        this.setState({ hoveredArea: area });
    }



render(){
    return(
    <div className="container">
    {console.log(this.URL)}
    {console.log(this.MAP)}
    {console.log(this.state)}
        <ImageMapper src={require('./img/wordcloud.png')} map={this.MAP} width={500} height={500}
        onClick={area => this.getSubImage1(area)}

    	/>
        {this.state.hoveredArea!==null? <div><img src={require('./img/activation.jpeg')} width={500} height={500}/></div> : <div>NO AREAA SELECTED</div>
        }

        <canvas id="canvas" width="500" height="500">HERE</canvas>

    </div>

    );
}

}

/*class SemacticDictonary extends Component{


    render(){
        return (
            <div w3-include-html="sem_dict.html"></div>
    );
    }

}*/

export default SemacticDictonary;
