import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      {/* From Uiverse.io (customized for Add/Adding) */}
      <div className="btn-wrapper">
        <button className="btn">
          <svg
            className="btn-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M5 12h14M12 5v14"
            />
          </svg>
          <div className="txt-wrapper">
            <div className="txt-1">
              <span className="btn-letter">Add</span>
              <span>&nbsp; </span>
              <span className="btn-letter">cart</span>
            </div>
            <div className="txt-2">
              <span className="btn-letter">A</span>
              <span className="btn-letter">d</span>
              <span className="btn-letter">d</span>
              <span className="btn-letter">e</span>
              <span className="btn-letter">d</span>
            </div>
          </div>
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .btn-wrapper {
    position: relative;
    display: inline-block;
  }

  .btn {
    --border-radius: 20px;
    --padding: 4px;
    --transition: 0.4s;
    --button-color: #faeade90; /* base soft peach */
    --highlight-color-hue: 20deg; /* gentle warm hue for light glow */

    user-select: none;
    display: flex;
    justify-content: center;
    padding: 0.5em 0.5em 0.5em 1.1em;
    font-family: "Poppins", "Inter", "Segoe UI", sans-serif;
    font-size: 1em;
    font-weight: 500;

    background-color: var(--button-color);
    border: 1px solid #f5b9b0; /* soft pink border tone */
    border-radius: var(--border-radius);
    cursor: pointer;
    transition:
      box-shadow var(--transition),
      border var(--transition),
      background-color var(--transition);
  }

  .btn::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
   
    height: 100%;
    border-radius: inherit;
    pointer-events: none;
    background-image: linear-gradient(
      0deg,
      #fff,
      hsl(var(--highlight-color-hue), 100%, 75%),
      hsla(var(--highlight-color-hue), 100%, 70%, 0.4),
      8%,
      transparent
    );
    background-position: 0 0;
    opacity: 0;
    transition:
      opacity var(--transition),
      filter var(--transition);
  }

  .btn-letter {
    position: relative;
    display: inline-block;
    color: #5c3a33; /* deep muted rose brown text */
    animation: letter-anim 2s ease-in-out infinite;
    transition:
      color var(--transition),
      text-shadow var(--transition),
      opacity var(--transition);
  }

  @keyframes letter-anim {
    50% {
      text-shadow: 0 0 3px #fff9;
      color: #e3746b; /* soft coral pulse compatible with base tone */
    }
  }

  .btn-svg {
    flex-grow: 1;
    height: 24px;
    margin-right: 0.5rem;
    fill: #5c3a33; /* same as text color */
    animation: flicker 2s linear infinite;
    animation-delay: 0.5s;
    filter: drop-shadow(0 0 2px #fff8);
    transition:
      fill var(--transition),
      filter var(--transition),
      opacity var(--transition);
  }

  @keyframes flicker {
    50% {
      opacity: 0.3;
    }
  }

  /* Text switching animation setup */
  .txt-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 5.0em;
  }
  .txt-1,
  .txt-2 {
    position: absolute;
    word-spacing: -2px;
    gap: 3px;
  }
  .txt-1 {
    animation: appear-anim 1s ease-in-out forwards;
  }
  .txt-2 {
    opacity: 0;
  }
  @keyframes appear-anim {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .btn:focus .txt-1 {
    animation: opacity-anim 0.3s ease-in-out forwards;
    animation-delay: 1s;
  }
  .btn:focus .txt-2 {
    animation: opacity-anim 0.3s ease-in-out reverse forwards;
    animation-delay: 1s;
  }
  @keyframes opacity-anim {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* Letter animations remain unchanged */
  .btn:focus .btn-letter {
    animation:
      focused-letter-anim 1s ease-in-out forwards,
      letter-anim 1.2s ease-in-out infinite;
    animation-delay: 0s, 1s;
  }

  @keyframes focused-letter-anim {
    0%,
    100% {
      filter: blur(0px);
    }
    50% {
      transform: scale(2);
      filter: blur(10px) brightness(150%)
        drop-shadow(-36px 12px 12px hsl(var(--highlight-color-hue), 100%, 75%));
    }
  }

  /* Hover and focus visual glow */
  .btn:hover {
    border: 1px solid #f6a5a3; /* slightly deeper pink border */
  }

  .btn:hover::before {
    box-shadow:
      0 -8px 8px -6px #fff8 inset,
      0 -16px 16px -8px hsla(var(--highlight-color-hue), 100%, 80%, 0.25) inset,
      1px 1px 1px #fff3,
      2px 2px 2px #fff1,
      -1px -1px 1px #0002,
      -2px -2px 2px #0001;
  }

  .btn:hover::after {
    opacity: 1;
    mask-image: linear-gradient(0deg, #fff, transparent);
  }

  .btn:hover .btn-svg {
    fill: #fff;
    filter: drop-shadow(0 0 4px hsl(var(--highlight-color-hue), 100%, 70%))
      drop-shadow(0 -3px 5px #0006);
    animation: none;
  }

  .btn:active {
    border: 1px solid #f48f8a;
    background-color: #f8d3c6;
  }

  .btn:active .btn-letter {
    text-shadow: 0 0 1px hsl(var(--highlight-color-hue), 100%, 88%);
  }

  .btn:focus::after {
    opacity: 0.6;
    mask-image: linear-gradient(0deg, #fff, transparent);
    filter: brightness(100%);
  }
`;

export default Button;
