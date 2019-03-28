import React from 'react';
import './ImagePertubation.css';
import { FilePicker } from 'evergreen-ui'


export default (props) => 
  <div>
      <div style={{padding:20}}>Upload {props.name}</div>
      <FilePicker
        multiple={false}
        width={300}
        marginBottom={32}
        onChange={props.onChange}
      />

  </div>

