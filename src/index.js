import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter as Router,Route}  from 'react-router-dom';
import { Button } from 'evergreen-ui';

// Import custom components
import NavBar from './navBar';
import UploadImage from './Images';
import App from './App';
import Home from './Home';
import Visualize from "./Visualize";

const element = (
    <Router component={Home}>
    <div className='main'>
        <div className='nav'>
            <NavBar/>
        </div>
        <div className='container'>
            <Route path="/" exact={true} component={Home}/>
            <Route path="/Visualize" component={Visualize}/>
            <Route path="/Images" component={UploadImage}/>
            {/* <Route path="/Help" component={Help}/> */}
        </div>
    </div>
    </Router>
)
ReactDOM.render(element ,document.getElementById('root'));
// var element = React.createElement(Button, { className: 'greeting' }, 'Hello, world!');
// ReactDOM.render(element, document.getElementById('root'));
// serviceWorker.register();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
