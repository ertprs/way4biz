import React, { Component } from "react";
import "react-lazy-load-image-component/src/effects/blur.css";
export class Image extends Component {
  text = React.createRef();
  componentDidMount() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          imageObserver.unobserve(image);
        }
      });
    });

    imageObserver.observe(this.text.current);
  }
  componentDidUpdate() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          imageObserver.unobserve(image);
        }
      });
    });

    imageObserver.observe(this.text.current);
  }
  render() {
    return (
      <React.Fragment>
        <img
          className="loading"
          data-src={this.props.image}
          ref={this.text}
          src="/load.jpg"
          alt={this.props.alt}
          height={this.props.height}
          width={this.props.width}
          style={{ margin: "auto" }}
        />
      </React.Fragment>
    );
  }
}

export default Image;
