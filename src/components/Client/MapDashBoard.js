import React from 'react';
import ViewDataMap from '../DataMap/ViewDataMap';

export default class MapDashBoard extends React.Component {
    constructor() {
        super();
        this.state = {
            zoomIndex: 1
        }
    }
    zoomButton(){
        this.setState({zoomIndex: 2});
    }
	render() {
		const {dataSet, height} = this.props;
		return (
			<ViewDataMap
			scope="usa"
			zoomIndex={this.state.zoomIndex}
			geographyConfig={{
				highlightBorderColor: '#bada55',
				popupTemplate: (geography, data) =>
					`<div class='hoverinfo' style="color: '#000'">
					<p>${geography.properties.name}</p>
					<p>Uploads: ${data.uploads}</p>`,
				highlightBorderWidth: 3
			}}
			fills={{
				'Color1': '#012c3c',
				'Color2': '#015778',
				'Color3': '#00adef',
				'Color4': '#66cef5',
				'Color5': '#9ae0f9',
				'defaultFill': '#ffffff'
			}}
			height={height}
			data={dataSet}
			labels
		/>
            

		);
	}

}
