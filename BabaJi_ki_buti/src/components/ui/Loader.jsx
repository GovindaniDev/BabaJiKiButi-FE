import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinner">
        <div className="spinner1" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #faeade; /* 🌸 Soft warm peach background */

  .spinner {
    background-image: linear-gradient(135deg, #b76cf7 35%, #7ee8fa);
    width: 100px;
    height: 100px;
    animation: spinning82341 1.5s linear infinite;
    text-align: center;
    border-radius: 50%;
    filter: blur(1px);
    box-shadow:
      0px -5px 25px 0px rgba(183, 108, 247, 0.55),
      0px 5px 25px 0px rgba(126, 232, 250, 0.55);
  }

  .spinner1 {
    background-color: #fdf8ff; /* Subtle off-white lavender glow */
    width: 100px;
    height: 100px;
    border-radius: 50%;
    filter: blur(10px);
  }

  @keyframes spinning82341 {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default Loader;
