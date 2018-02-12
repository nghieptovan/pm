
import React, {Component, PropTypes} from 'react';
import DataMap from './DataMap';
import data from './data';
import RadioGroup from 'react-radio-group';

export default class MapView extends Component {
    constructor(props) {
        super(props);
        var dataset = {};
        var onlyValues = data.series2.map(function(obj) {
            return obj[1];
        });
        var minValue = Math.min.apply(null, onlyValues),
            maxValue = Math.max.apply(null, onlyValues);

        var paletteScale = d3.scale.linear().domain([minValue, maxValue]).range(["#99dff9", "#00adef"]);
        data.series1.forEach(function(item) {
            var iso = item[0],
                value = item[1],
                region = item[2];
            dataset[iso] = {
                numberOfThings: value,
                fillColor: paletteScale(value),
                region: region
            };
        });
        this.state = {
            scope: 'usa',
            selectedRegion:'ALL',
            allData: dataset,
            data: dataset,
            fills: {
                'MAJOR': '#306596',
                'MEDIUM': '#0fa0fa',
                'MINOR': '#bada55',
                defaultFill: '#2b9fc8'
            },
            geographyConfig: {
                borderColor: '#888',
                borderWidth: .5,
                highlightBorderWidth: .5,
                highlightBorderColor: 'black',
                highlightFillColor: function(geo) {
                    return geo['fillColor'] || '#2b9fc8';
                },
                popupTemplate: function(geo, data) {
                    if (!data) {
                        return;
                    }
                    return [
                        '<div class="hoverinfo">',
                        '<strong>',
                        geo.properties.name,
                        '</strong>',
                        '<br>Count: <strong>',
                        data.numberOfThings,
                        '</strong>',
                        '</div>'
                    ].join('');
                }
            }
        };

    }

    update = (region) => {
        var _this = this;
        let filteredData = Object.keys(this.state.allData).filter(function(country) {
            let item = _this.state.allData[country];
            if (item.region === region || 'ALL' === region) {
                return true;
            } else {
                return false;
            }
        });

        let regionData = {};
        filteredData.map(function(country) {
            regionData[country] = _this.state.allData[country];
        });

        this.setState(Object.assign({}, {
            data: regionData,
            selectedRegion:region
        }, window.example));
    }

    render() {
        return (
            <Datamap style={{height: '230px'}} {...this.state}/>
        );
    }
}