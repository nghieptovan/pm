import videojs from 'video.js';
import React, {Component} from 'react';
import {s3URL} from '../../config';
export default class VideoPlayer extends Component {
      constructor(props) {
        super(props);
        this.state = {
          updateCount: 0
        };
      }
      
      setup() {
        let updateCount = this.state.updateCount;
        this.setState({
          updateCount: updateCount + 1
        });
      }
    
      componentDidMount() {
        this.setup();
      }
    
      componentWillReceiveProps(nextProps) {
        // You should probably change this check
        if(this.props !== nextProps)
          this.setup();
      }
    
      componentDidUpdate(prevProps, prevState) {
        if(this.state.updateCount !== prevState.updateCount) {
          // If it has a player, dispose
          if(this.player) {
            this.player.dispose();
          }
          // Create new player
          this.player = videojs(this.videoNode, this.props);
        }
      }
    
      componentWillUnmount() {
        // Dispose player on unmount
        if(this.player) {
          this.player.dispose();
        }
      }
      render() {
        // Use `key` so React knows this item is going to change
        const key = `${this.props.id || ''}-${this.state.updateCount}`;
        const {sources} = this.props;
        
        return (
          <div key={key} data-vjs-player>
            <video ref={ node => this.videoNode = node } className="video-js"
            controls
            preload="auto"
            poster="//vjs.zencdn.net/v/oceans.png"
            data-setup='{}'>
            <source key="hieudeptrai" src={`${s3URL}${sources.contentUri}`} type={`${sources.type}`}></source>            
            </video>
          </div>
        )
      }
    }