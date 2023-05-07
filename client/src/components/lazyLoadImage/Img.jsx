//lazy load component
import { LazyLoadImage } from "react-lazy-load-image-component";

//css
import "react-lazy-load-image-component/src/effects/blur.css";

const Img = ({ src }) => {
  return (
    <LazyLoadImage
      style={{
        transition: "1s",
      }}
      effect="blur"
      src={src}
    />
  );
};

export default Img;
