import React from 'react';
import minions from 'assets/peabody.png';
import PropTypes from 'prop-types';
import { Hero, Text, Wrapper } from './InitialStateGallery.styled';

export const InitialStateGallery = ({ text }) => {
  return (
    <Wrapper>
      <Text>{text}</Text>
      <Hero src={minions} alt="Minions" />
    </Wrapper>
  );
};

InitialStateGallery.propTypes = {
  text: PropTypes.string.isRequired,
};
