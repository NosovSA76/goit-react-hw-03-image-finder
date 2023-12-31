import PropTypes from 'prop-types';
import { animateScroll } from 'react-scroll';
import React, { Component } from 'react';
import { List } from './ImageGallery.styled';
import { ImageGalleryItem } from '../ImageGalleryItem/ImageGalleryItem';
import DefaultImg from 'assets/pbsh.png';
import { Loader } from '../Loader/Loader';
import ImageErrorView from 'components/ImageErrorView/ImageErrorView';
import { InitialStateGallery } from '../InitialStateGallery/InitialStateGallery';
import { Button } from 'components/Button/Button';
import Modal from 'components/Modal/Modal';
import imagesAPI from 'services/getImages';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export default class ImageGallery extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
  };

  state = {
    value: '',
    images: [],
    error: null,
    status: Status.IDLE,

    page: 1,
    totalPages: 0,

    isShowModal: false,
    modalData: { img: DefaultImg, tags: '' },
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.value !== nextProps.value) {
      return { page: 1, value: nextProps.value };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { page } = this.state;
    const prevValue = prevProps.value;
    const nextValue = this.props.value;
    if (prevValue !== nextValue || prevState.page !== page) {
      this.setState({ status: Status.PENDING });

      if (this.state.error) {
        this.setState({ error: null });
      }
      imagesAPI
        .getImages(nextValue, page)
        .then(images => {
          this.setState(prevState => ({
            images:
              page === 1 ? images.hits : [...prevState.images, ...images.hits],
            status: Status.RESOLVED,
            totalPages: Math.floor(images.totalHits / 12),
          }));
        })
        .catch(error => this.setState({ error, status: Status.REJECTED }));
    }
  }

 handleLoadMore = () => {
  this.setState(prevState => ({ page: prevState.page + 1 }), () => {
    animateScroll.scrollMore(600);
  });
};

  setModalData = modalData => {
    this.setState({ modalData, isShowModal: true });
  };

  handleModalClose = () => {
    this.setState({ isShowModal: false });
  };

  render() {
    const { images, error, status, page, totalPages, isShowModal, modalData } =
      this.state;

    if (status === 'idle') {
      return <InitialStateGallery text="We will find what you want!" />;
    }
    if (status === 'pending') {
      return <Loader />;
    }
    if (status === 'rejected') {
      return <ImageErrorView message={error.message} />;
    }
    if (images.length === 0) {
      return (
        <ImageErrorView
          message={`Oops... there are no images matching your search... `}
        />
      );
    }

    if (status === 'resolved') {
      return (
        <>
          <List>
            {images.map(image => (
              <ImageGalleryItem
                key={image.id}
                item={image}
                onImageClick={this.setModalData}
              />
            ))}
          </List>
          {images.length > 0 && status !== 'pending' && page <= totalPages && (
            <Button onClick={this.handleLoadMore}>Load More</Button>
          )}
          {isShowModal && (
            <Modal modalData={modalData} onModalClose={this.handleModalClose} />
          )}
        </>
      );
    }
  }
}
