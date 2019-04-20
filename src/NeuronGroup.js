import React, { Component } from 'react';

class NeuronGroup extends Component{



  render() {

  img, n_groups, spatial_factors, group_icons = 0, 0, 0, 0
  pres_n = null
  return <div class="figure" style="width: 600px;">
            <div class="outer" onMouseOver="set({pres_n: undefined})">
              <img src={img}/>
              {pres_n != null && <img src={spatial_factors[pres_n]} class="overlay"/>}
            </div>
            
            {/* <div class="outer" on:mouseover="set({pres_n: undefined})">
              <div style="width:100%; height: 100%; background-color: #000;"></div>
              {{#each range(n_groups) as n}} 
              {{#if pres_n == undefined || pres_n == n}}
              <img src="{{spatial_factors[n]}}" class="factor" 
                  style="filter: hue-rotate({{n*360/n_groups}}deg);">
              {{/if}}
              {{/each}}
            </div>
            
            <br>
            <br>
            
            <div on:mouseleave="set({pres_n: undefined})">
              {{#each range(n_groups) as n}}
              <div class="group" style="background-color: hsl({{n*360/n_groups}}, 80%, 50%); "
                  on:mouseover="set({pres_n: n})">
                <img src="{{group_icons[n]}}">
              </div>
              {{/each}}
            </div> */}
            
          </div>
  }





}