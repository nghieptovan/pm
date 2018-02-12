import React from 'react';

const SampleNextArrow = (props) => {
    const {className, style, onClick} = props
    return (
      <div className="slick-arrow1 slick-next1"
        onClick={onClick}
      >
      <i className="icon-arrow-right"></i>
      </div>
    );
  }
  
const SamplePrevArrow = (props) => {
    const {className, style, onClick} = props
    return (
      <div className="slick-arrow1 slick-prev1"
        onClick={onClick}
      >
      <i className="icon-arrow-left"></i>
      </div>
    );
  }

export {
    SampleNextArrow,
    SamplePrevArrow
};
