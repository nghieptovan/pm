import React, { Component } from 'react';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,
  Marker
} from 'react-simple-maps';

export default class DataMap2 extends Component {
  constructor() {
    super()

    this.state = {
      zoom: 1,
      centerX: 0,
      centerY: 0
    }
  }
  handleZoomIn = () => {
    this.setState({
      zoom: this.state.zoom * 1.25,
    })
  }
  handleZoomOut = () => {
    this.setState({
      zoom: this.state.zoom / 1.25,
    })
  }
  handleHover = (geography) => {
     
  }
  showThatCountry = (geography) => {
    this.setState({
      centerX: geography.geometry.coordinates[0][0][0][0],
      centerY: geography.geometry.coordinates[0][0][0][1],
      zoom: this.state.zoom * 2
    });
  }
  render() {
    return(
      <div className="row-fluid">      
        <div className="col-lg-11 col-md-11 col-sm-10 col-xs-10">
            <ComposableMap className="mapworld">
                <ZoomableGroup zoom={ this.state.zoom } center={ [this.state.centerX , this.state.centerY]}>
                    <Geographies geographyUrl={ 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/examples/with-react-tooltip/static/world-50m.json' }>
                        {(geographies, projection) => geographies.map((geography, i) => (
                        <Geography
                            key={i}
                            geography={ geography }
                            projection={ projection }
                            style={{
                                default: {
                                fill: "#5bc0de",
                                stroke: "#607D8B",
                                strokeWidth: 0.75,
                                outline: "none",
                                },
                                hover: {
                                fill: "#FF5722",
                                stroke: "#607D8B",
                                strokeWidth: 0.75,
                                outline: "none",
                                },
                                pressed: {
                                fill: "#FF5722",
                                stroke: "#607D8B",
                                strokeWidth: 0.75,
                                outline: "none",
                                },
                            }}
                            />            
                        ))}
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
        <div className="col-lg-1 col-md-1 col-sm-2 col-xs-2">
            <div className="zoominout">
                <i onClick={ this.handleZoomIn } className="fa fa-plus" aria-hidden="true"></i>
                <i onClick={ this.handleZoomOut } className="fa fa-minus" aria-hidden="true"></i>
            </div>
        </div>
      </div>
    )
  }
}