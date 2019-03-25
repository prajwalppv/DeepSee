import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Button, Pane, Tab, TabNavigation, Paragraph, Tablist } from 'evergreen-ui'
import {Link}  from 'react-router-dom';

class NavBar extends Component{
    state={
        selectedIndex:0,
        tabs: ['Home','Visualize','Images','Help'],
        icons:['home','series-configuration','cloud-upload','help']
    }
    render(){
        return(
            <Pane height={48}>
      <TabNavigation marginBottom={16} flexBasis={240} marginRight={24}>
        {this.state.tabs.map((tab, index) => (
          <Button
            key={tab}
            is='a'
            id={tab}
            iconBefore={this.state.icons[index]}
            onSelect={() => this.setState({ selectedIndex: index })}
            isSelected={index === this.state.selectedIndex}
            aria-controls={`panel-${tab}`}
            href={tab}
            height={48}
          >
          {tab}
          </Button>
          
        ))}
      </TabNavigation>
    </Pane>
        );
    }
}
export default NavBar;